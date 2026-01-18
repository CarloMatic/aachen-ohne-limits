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
    const MIN_SCALE = 1;      // Final scale matches the static logo scale? 
    // Actually, the static logo is width: 60vw. 
    // The bg-logo-img also has width: 60vw.
    // So MIN_SCALE should be 1 to match perfectly.
    const START_X = -110;     // Start further left

    function updateLogoState() {
        if (!bgLogo || !bgLogoFull || !staticLogo) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // --- CALCULATE ANCHOR POSITION ---
        // We want to lock when the static logo is roughly centered?
        // Or simply: calculate where the Static Logo IS right now relative to viewport center.
        // And move the Fixed Logo to match it.

        const staticRect = staticLogo.getBoundingClientRect();
        const staticCenterY = staticRect.top + (staticRect.height / 2);
        const viewportCenterY = viewportHeight / 2;

        // The difference: how far is the static logo from the center of the screen?
        const deltaY = staticCenterY - viewportCenterY;

        // --- TRIGGER POINTS ---

        // "Lock Point" is when the static logo arrives at the center of the screen.
        // We can pre-calculate the scroll position for this.
        const staticOffsetTop = staticLogo.getBoundingClientRect().top + window.scrollY; // Absolute doc position
        const lockScrollPos = staticOffsetTop + (staticRect.height / 2) - (viewportHeight / 2);

        let animationEndPoint = lockScrollPos;

        // Crossfade Config
        // Fade from Mindset -> Lock Point
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
            // PHASE 1: Zoom In TOWARDS the Anchor
            let progress = scrolled / animationEndPoint;
            // progress = Math.max(0, Math.min(progress, 1));
            // Let's allow it to slightly overshoot if needed, or stick to clamp?
            // Clamp for safety.
            progress = Math.max(0, Math.min(progress, 1));

            // Cubic Easing for natural swoop
            const eased = 1 - Math.pow(1 - progress, 3);

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);

            // Move X: Left -> Center (0)
            // Note: Our CSS centers it. So target X is 0 (relative to center).
            // But wait, START_X is -110%. Target is 0%.
            moveX = START_X + ((0 - START_X) * eased);

            // Move Y:
            // We want it to LAND at 'deltaY' (which would be 0 at animationEndPoint).
            // But initially we want it centered (0).
            // So interpolate from 0 to deltaY? 
            // Actually, if we want it to look "Fixed" until the lock, keep Y=0.
            // USER REQUEST: "gleiche Scrollanimation wie das AC Logo".
            // AC Logo was fixed centered.
            moveY = 0;

            // BUT: At the exact end of this phase, moveY MUST equal the anchor's deltaY (which is 0).
            // So moveY = 0 works perfectly for the handoff.

        } else {
            // PHASE 2: LOCKED TO CONTENT
            // We strictly follow the Static Anchor's position.
            scale = MIN_SCALE;
            moveX = 0; // Centered horizontally

            // Match the vertical offset of the anchor
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

        // Hide Fixed Logos if scrolled VERY far past? 
        // Or if the content covers them? 
        // User wants them "above".
        // They are z-index 1. Content is z-index 2.
        // Actually, if we track the anchor, the fixed layer sits BEHIND the content text?
        // We might need to ensure the Fixed Layer is z-index compatible.
        // The user said: "and stands ABOVE it [the content? or above the headline?]".
        // "sodass dieser darüber scrollt" -> "so that it [the text?] scrolls over it [the logo]?"
        // "hinter den Text" (Previous prompt) -> Logo behind Text.
        // "darüber steht" (This prompt) -> Stands above? 
        // "darüber scrollt" usually means "scrolls over".
        // Let's assume standard behavior: Logo is background, Text is foreground.

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
    window.addEventListener('resize', updateLogoState); // Handle resize
    updateLogoState();

    // IntersectionObserver (Existing)
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
