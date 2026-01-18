document.addEventListener('DOMContentLoaded', () => {
    console.log('Aachen ohne Limits - Loaded');

    // Fixed Background Layers
    const bgLogo = document.getElementById('bgLogo');
    const bgLogoFull = document.getElementById('bgLogoFull');

    // The Content Anchor (Invisible placeholder)
    const staticLogo = document.getElementById('static-logo');

    // Header Logos
    const logoStart = document.getElementById('logoStart');
    const logoEnd = document.getElementById('logoEnd');

    // Config values
    const HERO_SCALE = 8;     // Start at 800%
    const MIN_SCALE = 1;      // Final scale matching 60vw
    const START_X = -110;     // Start further left
    const END_X = -50;        // Center

    function updateLogoState() {
        if (!bgLogo || !bgLogoFull || !staticLogo) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const isMobile = window.innerWidth < 768;

        // Responsive Offset
        // Desktop: Lift significantly (-180px) to clear headline
        // Mobile: Lift less (-60px) to keep it tight
        const OFFSET_Y = isMobile ? -60 : -180;

        // --- CORE CALCULATIONS for CONTINUITY ---

        // 1. Where is the Anchor physically located on the full page document?
        const staticRect = staticLogo.getBoundingClientRect();
        const staticAbsoluteTop = staticRect.top + scrolled;
        const staticHeight = staticRect.height;

        // 2. Where is it currently relative to the viewport center?
        const staticCenterY = staticRect.top + (staticHeight / 2);
        const viewportCenterY = viewportHeight / 2;

        // Phase 2 Target Y: The anchor's distance from center + our manual lift
        const currentTrackingY = (staticCenterY - viewportCenterY) + OFFSET_Y;

        // 3. Define the Lock Point (Animation End Point)
        // This is the SCROLL POSITION where 'staticCenterY' equals 'viewportCenterY'.
        const lockScrollPos = staticAbsoluteTop + (staticHeight / 2) - (viewportCenterY);

        // Ensure we don't lock before the page even allows (e.g. if it's at top)
        let animationEndPoint = lockScrollPos;
        if (animationEndPoint < viewportHeight) animationEndPoint = viewportHeight;

        // --- OTHER TRIGGERS ---

        // Crossfade
        const mindsetSection = document.getElementById('section-mindset');
        const mindsetTop = mindsetSection ? mindsetSection.offsetTop : viewportHeight;

        // Start fading earlier? 
        const fadeStartPoint = mindsetTop - (viewportHeight * 0.5);
        const fadeEndPoint = animationEndPoint;

        // Light Mode
        const contactSection = document.querySelector('.contact-section');
        const contactTop = contactSection ? contactSection.offsetTop : 99999;
        const breakPointLightMode = contactTop - (viewportHeight * 0.8);

        // --- APPLY LOGIC ---

        if (scrolled >= breakPointLightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        let scale = HERO_SCALE;
        let moveX = START_X;
        let moveY = 0;

        if (scrolled < animationEndPoint) {
            // PHASE 1: ZOOM IN
            let progress = scrolled / animationEndPoint;
            // progress = Math.max(0, Math.min(progress, 1));
            // Let's allow it to slightly overshoot if needed for continuity?
            // Actually, for the interpolation math to match tracking Y exactly at the handoff, 
            // we need exact 0-1 range relative to lock point.
            progress = Math.max(0, Math.min(progress, 1));

            const eased = 1 - Math.pow(1 - progress, 3); // Cubic Out

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);
            moveX = START_X + ((END_X - START_X) * eased);

            // Y INTERPOLATION
            // Start: 0 (Visual Center)
            // End: OFFSET_Y
            // Mathematically: At progress=1 (scrolled=lockScrollPos), 
            // currentTrackingY = (0) + OFFSET_Y = OFFSET_Y.
            // So if we interpolate to OFFSET_Y, the handoff is seamless.
            moveY = OFFSET_Y * eased;

        } else {
            // PHASE 2: LOCKED TRACKING
            scale = MIN_SCALE;
            moveX = END_X;

            // Directly follow the anchor
            moveY = currentTrackingY;
        }

        // --- CROSSFADE ---
        let logoOpacity = 1;
        let fullLogoOpacity = 0;

        if (scrolled >= fadeStartPoint) {
            let fadeProgress = (scrolled - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
            fadeProgress = Math.max(0, Math.min(fadeProgress, 1));

            logoOpacity = 1 - fadeProgress;
            fullLogoOpacity = fadeProgress;
        }

        // Header Sync
        if (logoStart && logoEnd) {
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));
            logoStart.style.opacity = Math.max(0, 1 - (progress * 3));
            logoEnd.style.opacity = progress;
        }

        // Apply
        const transformString = `translate(${moveX}%, ${moveY}px) rotate(0deg) scale(${scale})`;

        bgLogo.style.transform = transformString;
        bgLogo.style.opacity = logoOpacity;

        bgLogoFull.style.transform = transformString;
        bgLogoFull.style.opacity = fullLogoOpacity;
    }

    // Load handling
    window.addEventListener('load', updateLogoState);
    window.addEventListener('scroll', updateLogoState);
    window.addEventListener('resize', updateLogoState);

    // Initial call
    updateLogoState();

    // IntersectionObserver
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
    }, observerOptions);

    document.querySelectorAll('.hero-headline, .manifesto-text').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `.in-view { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
});
