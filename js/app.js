document.addEventListener('DOMContentLoaded', () => {
    console.log('Aachen ohne Limits - Loaded');

    // Dynamic Background Logo Animation
    const bgLogo = document.getElementById('bgLogo');

    // Header Logos
    const logoStart = document.getElementById('logoStart');
    const logoEnd = document.getElementById('logoEnd');

    // Config values
    const HERO_SCALE = 8;     // Start at 800%
    const MIN_SCALE = 1;      // Final scale
    const START_X = -60;      // Start at -60% left

    function updateLogoState() {
        if (!bgLogo) return;

        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // --- TRIGGER POINTS ---

        // 1. End of Main Animation (Logo Locks at Scale 1, X=0)
        // Target: "Eine Marke" section (#section-strength)
        const strengthSection = document.getElementById('section-strength');
        // Lock point: Section Top - 50% Viewport
        let animationEndPoint = strengthSection ? (strengthSection.offsetTop - (viewportHeight * 0.5)) : (viewportHeight * 2);

        // Safety
        if (animationEndPoint < viewportHeight) animationEndPoint = viewportHeight;

        // 2. Light Mode Trigger (Contact Section)
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
        let opacity = 1;

        if (scrolled < animationEndPoint) {
            // PHASE 1: Zoom In to Lock
            let progress = scrolled / animationEndPoint;
            progress = Math.max(0, Math.min(progress, 1));

            // Cubic Easing
            const eased = 1 - Math.pow(1 - progress, 3);

            scale = HERO_SCALE - ((HERO_SCALE - MIN_SCALE) * eased);

            const endX = 0;
            moveX = START_X + ((endX - START_X) * eased);

            // Header Logo Crossfade
            if (logoStart && logoEnd) {
                logoStart.style.opacity = Math.max(0, 1 - (progress * 3));
                logoEnd.style.opacity = progress;
            }

        } else {
            // PHASE 2: Parallel Scroll (Natural Movement)
            scale = MIN_SCALE;
            moveX = 0;

            if (logoStart && logoEnd) {
                logoStart.style.opacity = 0;
                logoEnd.style.opacity = 1;
            }

            // Calculate pixels scrolled past the lock point
            const scrolledPast = scrolled - animationEndPoint;

            // Move UP naturally (1px scroll = 1px up)
            moveY = -scrolledPast;
            moveYUnit = 'px';
        }

        // Apply Transforms
        bgLogo.style.transform = `translate(${moveX}%, ${moveY}${moveYUnit}) rotate(0deg) scale(${scale})`;
        bgLogo.style.opacity = opacity;
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
