document.addEventListener('DOMContentLoaded', () => {
    console.log('Aachen ohne Limits - Loaded');

    // Dynamic Background Logo Animation
    const bgLogo = document.getElementById('bgLogo');
    const bgLogoFull = document.getElementById('bgLogoFull');

    // Header Logos
    const logoStart = document.getElementById('logoStart');
    const logoEnd = document.getElementById('logoEnd');

    // Config values
    const HERO_SCALE = 8;     // Start at 800%
    const MIN_SCALE = 1;      // Final scale
    const START_X = -60;      // Start at -60% left

    function updateLogoState() {
        if (!bgLogo || !bgLogoFull) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // --- TRIGGER POINTS ---

        // 1. Crossfade START: "Es ist ein neues Mindset" section
        const mindsetSection = document.getElementById('section-mindset');
        // Start fading when this section enters the viewport (or hits middle? "Ab" suggests upon arrival)
        // Let's create a smooth zone: from when Mindset enters viewport until...
        const mindsetTop = mindsetSection ? mindsetSection.offsetTop : viewportHeight;

        // 2. Crossfade END / Lock Point: "Eine Marke" section
        const strengthSection = document.getElementById('section-strength');
        // This is also the main animation end point where it locks and starts parallel scroll
        const strengthTop = strengthSection ? (strengthSection.offsetTop) : (viewportHeight * 2);

        let animationEndPoint = strengthTop - (viewportHeight * 0.5); // Lock when centered
        if (animationEndPoint < viewportHeight) animationEndPoint = viewportHeight;

        // Define the Crossfade Zone
        // Fade starts when we scroll past Mindset section top (minus some offset to start earlier?)
        // User said: "Fade das AC Logo ab 'Es ist ein neues Mindset' aus"
        // Let's start the fade slightly before the lock point to ensure it's fully transformed by the end.
        // Actually, the user wants it "bis zum nächsten Modul". So the duration is the distance between Mindset and Strength.

        const fadeStartPoint = mindsetTop - (viewportHeight * 0.5); // Start when Mindset is centered
        const fadeEndPoint = animationEndPoint; // Finish exactly when it locks

        // 3. Light Mode Trigger
        const contactSection = document.querySelector('.contact-section');
        const contactTop = contactSection ? contactSection.offsetTop : 99999;
        const breakPointLightMode = contactTop - (viewportHeight * 0.8);

        // --- LOGIC ---

        // Toggle Light Mode
        if (scrolled >= breakPointLightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        let scale = HERO_SCALE;
        let moveX = START_X;
        let moveY = 0;
        let moveYUnit = '%';

        // -- MOTION & SCROLLING --

        if (scrolled < animationEndPoint) {
            // PHASE 1: Zoom In to Lock
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));

            // Cubic Easing
            const eased = 1 - Math.pow(1 - progress, 3);

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);

            const endX = 0;
            moveX = START_X + ((endX - START_X) * eased);

        } else {
            // PHASE 2: Parallel Scroll
            scale = MIN_SCALE;
            moveX = 0;

            // Calculate pixels scrolled past the lock point
            const scrolledPast = scrolled - animationEndPoint;

            // Move UP naturally (1px scroll = 1px up)
            moveY = -scrolledPast;
            moveYUnit = 'px';
        }

        // -- CROSSFADE LOGIC --
        // Fade from AC (bgLogo) -> Full (bgLogoFull)
        // Range: fadeStartPoint -> fadeEndPoint

        let logoOpacity = 1;      // AC Mark
        let fullLogoOpacity = 0;  // Full Logo

        if (scrolled >= fadeStartPoint) {
            let fadeProgress = (scrolled - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
            fadeProgress = Math.max(0, Math.min(fadeProgress, 1));

            logoOpacity = 1 - fadeProgress;
            fullLogoOpacity = fadeProgress;
        } else {
            // Before the start point
            logoOpacity = 1;
            fullLogoOpacity = 0;
        }

        // HEADER LOGO SYNC
        // If we showing full logo in background, maybe hide header logos or keep them?
        // Let's keep existing header behavior (fade to logo.svg)
        if (logoStart && logoEnd) {
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));
            logoStart.style.opacity = Math.max(0, 1 - (progress * 3));

            // If background is showing full logo, header logo might duplicate it.
            // But usually header logo is small, bg logo is HUGE.
            // We'll keep header logo fading in as normal for now.
            logoEnd.style.opacity = progress;
        }

        // Apply Transforms to BOTH
        const transformString = `translate(${moveX}%, ${moveY}${moveYUnit}) rotate(0deg) scale(${scale})`;

        bgLogo.style.transform = transformString;
        bgLogo.style.opacity = logoOpacity;

        bgLogoFull.style.transform = transformString;
        bgLogoFull.style.opacity = fullLogoOpacity;
    }

    // Run on Scroll
    window.addEventListener('scroll', updateLogoState);
    updateLogoState();

    // IntersectionObserver for Reveal Animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.hero-headline, .manifesto-text').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .in-view {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});
