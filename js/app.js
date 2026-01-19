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
        // We need distinct transforms for the Background Mark (bgLogo) and the Full Logo (bgLogoFull)
        // because the 'Mark' is only a small part (~30%) of the 'Full Logo'.

        // RATIOS calculated from SVG viewBoxes:
        // Full Logo Width: 414 | Mark Width: 126 => Ratio: 0.3043
        // Shift X: Mark Center (63) vs Logo Center (207) => -144 units relative to 414 => -34.78%
        // Shift Y: Mark Center (~53) vs Logo Center (61) => -8 units relative to 122 => Small correction ~ -1.1vw

        const AC_SCALE_RATIO = 0.3043;
        const AC_OFFSET_X_PERCENT = -8.0;

        // Convert VW offset to px for Y
        const vwInPx = window.innerWidth / 100;
        // -1.1vw rough estimate of vertical shift
        const AC_OFFSET_Y_PX = -1.1 * vwInPx;

        // 1. Transform for FULL LOGO (The anchor)
        // It follows the standard calculated path (Scale 1, Center -50%)
        const transformFull = `translate(${moveX}%, ${moveY}px) rotate(0deg) scale(${scale})`;
        bgLogoFull.style.transform = transformFull;
        bgLogoFull.style.opacity = fullLogoOpacity;

        // 2. Transform for AC MARK (The morphing element)
        // It needs to interpolate from its Big State (Hero) to the 'Mark Position' inside the Full Logo.

        // We explicitly calculate its own scale/move based on progress to ensure smooth transition
        let acScale, acMoveX, acMoveY;

        if (scrolled < animationEndPoint) {
            // STILL ANIMATING
            // We want it to START similar to before (Scale 8, X -110)
            // But END at the corrective target (Scale 1*Ratio, X -50+Offset)

            const progress = Math.max(0, Math.min(scrolled / animationEndPoint, 1));
            const eased = 1 - Math.pow(1 - progress, 3);

            // Interpolate Scale: 8 -> (1 * 0.3043)
            const targetScale = MIN_SCALE * AC_SCALE_RATIO;
            acScale = HERO_SCALE - ((HERO_SCALE - targetScale) * eased);

            // Interpolate X: -110 -> (-50 + -34.78)
            const targetX = END_X + AC_OFFSET_X_PERCENT;
            acMoveX = START_X + ((targetX - START_X) * eased);

            // Interpolate Y: 0 -> (OFFSET_Y + AC_OFFSET_Y_PX)
            const targetY = OFFSET_Y + AC_OFFSET_Y_PX;
            acMoveY = targetY * eased;

        } else {
            // LOCKED
            acScale = MIN_SCALE * AC_SCALE_RATIO;
            acMoveX = END_X + AC_OFFSET_X_PERCENT;
            acMoveY = currentTrackingY + AC_OFFSET_Y_PX;
        }

        const transformAC = `translate(${acMoveX}%, ${acMoveY}px) rotate(0deg) scale(${acScale})`;
        bgLogo.style.transform = transformAC;
        bgLogo.style.opacity = logoOpacity;

        // Final Header Visibility Logic
        // 1. Mobile/Tablet: Hide during Mindset -> Supporters
        // 2. GLOBAL: Hide in White Area (Light Mode) - requested by user to be empty
        // 3. Elsevier: Visible

        let headerVisible = true;

        if (window.innerWidth <= 1024) {
            // Mobile Zone Logic
            const mindsetSection = document.getElementById('section-mindset');
            const supportersSection = document.querySelector('.supporters-section');

            if (mindsetSection && supportersSection) {
                const mindsetRect = mindsetSection.getBoundingClientRect();
                const supportersRect = supportersSection.getBoundingClientRect();

                const enteredZone = mindsetRect.top < 300;
                const exitedZone = supportersRect.bottom < 100;

                if (enteredZone && !exitedZone) {
                    headerVisible = false;
                }
            }
        }

        // Global Override for White Area (using the calculated breakpoint or class)
        if (scrolled >= breakPointLightMode) {
            headerVisible = false;
        }

        // Apply to Header
        const header = document.querySelector('.header');
        if (header) {
            header.style.opacity = headerVisible ? '1' : '0';
            header.style.pointerEvents = headerVisible ? 'auto' : 'none';
        }
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
