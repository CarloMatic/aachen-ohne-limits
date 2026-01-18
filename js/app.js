document.addEventListener('DOMContentLoaded', () => {
    console.log('Aachen ohne Limits - Loaded');

    // Fixed Background Layers
    const bgLogo = document.getElementById('bgLogo');
    const bgLogoFull = document.getElementById('bgLogoFull');

    // The Content Anchor (Invisible, but reserves space & position)
    const staticLogo = document.getElementById('static-logo');

    // Header Logos
    const logoStart = document.getElementById('logoStart');
    const logoEnd = document.getElementById('logoEnd');

    // Config values
    const HERO_SCALE = 8;     // Start at 800%
    const MIN_SCALE = 1;      // Final scale matching 60vw
    const START_X = -110;     // Start further left
    const END_X = -50;        // Center: left:50% + translate(-50%)
    const OFFSET_Y = -80;    // Manual Lift (Visual correction "too low")

    function updateLogoState() {
        if (!bgLogo || !bgLogoFull || !staticLogo) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // --- CALCULATE ANCHOR POSITION ---
        const staticRect = staticLogo.getBoundingClientRect();
        const staticCenterY = staticRect.top + (staticRect.height / 2);
        const viewportCenterY = viewportHeight / 2;

        // How far is the static logo from the center of the screen?
        // We add OFFSET_Y to lift it visually higher than the actual anchor
        const deltaY = (staticCenterY - viewportCenterY) + OFFSET_Y;

        // --- TRIGGER POINTS ---

        // Lock Point: When the logo visually arrives at the center
        // This calculation predicts the scroll position where deltaY would be 0 (or OFFSET_Y)
        // But since we track deltaY continuously in Phase 2, we just need a smooth handoff.
        // Handoff happens when Phase 1 (Zoom) completes.
        // Let's define the endpoint based on the section position.

        const strengthSection = document.getElementById('section-strength');
        // Standard lock point: Section Top - 50% Viewport
        // Adjusted slightly for the lift
        const strengthTop = strengthSection ? strengthSection.offsetTop : (viewportHeight * 2);

        let animationEndPoint = strengthTop - (viewportHeight * 0.5) + OFFSET_Y;
        if (animationEndPoint < viewportHeight) animationEndPoint = viewportHeight;


        // Crossfade Config
        const mindsetSection = document.getElementById('section-mindset');
        const mindsetTop = mindsetSection ? mindsetSection.offsetTop : viewportHeight;

        const fadeStartPoint = mindsetTop - (viewportHeight * 0.5);
        const fadeEndPoint = animationEndPoint;

        // Light Mode Config
        const contactSection = document.querySelector('.contact-section');
        const contactTop = contactSection ? contactSection.offsetTop : 99999;
        const breakPointLightMode = contactTop - (viewportHeight * 0.8);

        // --- LOGIC ---

        if (scrolled >= breakPointLightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        let scale = HERO_SCALE;
        let moveX = START_X;
        let moveY = 0;

        // Determine Phase
        if (scrolled < animationEndPoint) {
            // PHASE 1: Zoom In 
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));

            const eased = 1 - Math.pow(1 - progress, 3);

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);

            // Move X: Left -> Center (END_X = -50)
            moveX = START_X + ((END_X - START_X) * eased);

            // Move Y: Interpolate to the Handoff Point
            // At 0% progress: 0 (Centered)
            // At 100% progress: It must match 'deltaY' at that moment.
            // But deltaY changes with scroll.
            // Simplified: Keep it 0 (Fixed Center) until the lock point?
            // "remains too high" -> imply it shouldn't be fixed 0? 
            // Actually, if we keep it 0, it stays centered.
            // The user wants it to END up higher.
            // So we can interpolate Y from 0 to OFFSET_Y?
            // Let's try keeping it 0 + a slight drift to OFFSET_Y
            moveY = OFFSET_Y * eased;

        } else {
            // PHASE 2: LOCKED TO CONTENT
            scale = MIN_SCALE;
            moveX = END_X; // -50% Corrects the Center

            // Track the anchor exactly
            moveY = deltaY;
        }

        // --- CROSSFADE LOGIC ---
        let logoOpacity = 1;
        let fullLogoOpacity = 0;

        if (scrolled >= fadeStartPoint) {
            let fadeProgress = (scrolled - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
            fadeProgress = Math.max(0, Math.min(fadeProgress, 1));

            logoOpacity = 1 - fadeProgress;
            fullLogoOpacity = fadeProgress;
        } else {
            logoOpacity = 1;
            fullLogoOpacity = 0;
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

    // Run on Scroll
    window.addEventListener('scroll', updateLogoState);
    window.addEventListener('resize', updateLogoState);
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
