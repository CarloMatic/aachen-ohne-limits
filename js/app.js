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
    const END_X = -50;        // Centered (since left is 50%)
    const START_X = -110;     // Start further left (-60% delta)

    function updateLogoState() {
        if (!bgLogo || !bgLogoFull) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // --- TRIGGER POINTS ---

        // 1. Crossfade START: "Es ist ein neues Mindset" section
        const mindsetSection = document.getElementById('section-mindset');
        const mindsetTop = mindsetSection ? mindsetSection.offsetTop : viewportHeight;

        // 2. Crossfade END / Lock Point: "Eine Marke" section
        const strengthSection = document.getElementById('section-strength');
        // This is also the main animation end point where it locks and starts parallel scroll
        const strengthTop = strengthSection ? (strengthSection.offsetTop) : (viewportHeight * 2);

        // Lock point: Section Top - 50% Viewport (Logo centered behind section)
        let animationEndPoint = strengthTop - (viewportHeight * 0.5);
        if (animationEndPoint < viewportHeight) animationEndPoint = viewportHeight;

        // Crossfade Zone
        // Fade starts when Mindset is roughly in view/centered
        const fadeStartPoint = mindsetTop - (viewportHeight * 0.5);
        const fadeEndPoint = animationEndPoint;

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

        // Vertical Centering Calculation
        // Since we are using absolute positioning (top: 50%), 
        // a Y-translation of -50% of viewport height centers the element.
        // We use pixels for Y to easily add standard scrolling later.
        const centerYPx = -(viewportHeight * 0.5);
        let moveY = centerYPx; // Default to centered

        // -- MOTION & SCROLLING --

        if (scrolled < animationEndPoint) {
            // PHASE 1: Zoom In to Lock
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));

            // Cubic Easing
            const eased = 1 - Math.pow(1 - progress, 3);

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);

            // X Animation: Left -> Center (-50)
            moveX = START_X + ((END_X - START_X) * eased);

            // Y Animation: Stays at centerYPx (Fixed Visual Center)

        } else {
            // PHASE 2: Parallel Scroll
            scale = MIN_SCALE;

            // X Stays Centered
            moveX = END_X;

            // Y Moves UP with Scroll
            // Calculate pixels scrolled past the lock point
            const scrolledPast = scrolled - animationEndPoint;

            // Add scroll offset to the centered position
            moveY = centerYPx - scrolledPast;
        }

        // -- CROSSFADE LOGIC --
        // Fade from AC (bgLogo) -> Full (bgLogoFull)

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

        // Header Logo Sync
        if (logoStart && logoEnd) {
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));
            logoStart.style.opacity = Math.max(0, 1 - (progress * 3));
            logoEnd.style.opacity = progress;
        }

        // Apply Transforms to BOTH
        // moveX is %, moveY is px
        const transformString = `translate(${moveX}%, ${moveY}px) rotate(0deg) scale(${scale})`;

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
