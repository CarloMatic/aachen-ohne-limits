document.addEventListener('DOMContentLoaded', () => {

    console.log('Aachen ohne Limits - Loaded');

    // DOM Elements
    const bgLogoFull = document.getElementById('bgLogoFull');
    const bgLogo = document.getElementById('bgLogo'); // Hide this
    const header = document.querySelector('.header');

    // Config
    const LOGO_HEIGHT_VH = 150; // 150% of viewport height

    // Initial Setup
    if (bgLogo) bgLogo.style.display = 'none';
    if (bgLogoFull) {
        bgLogoFull.style.opacity = '1';
        bgLogoFull.style.height = `${LOGO_HEIGHT_VH}vh`;
        bgLogoFull.style.width = 'auto';
        bgLogoFull.style.position = 'fixed';
        bgLogoFull.style.top = '50%';
        bgLogoFull.style.left = '50%';
        // We will animate separate transform, so set base here if needed, 
        // but typically we overwrite transform in the loop.
    }

    function updateAnimation() {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight - viewportHeight;

        // 0 to 1 progress
        const scrollProgress = Math.max(0, Math.min(scrolled / fullHeight, 1));

        // --- BACKGROUND LOGO ANIMATION ---
        if (bgLogoFull) {
            // "Right out of picture" to "Left out of picture"
            // Start: 100vw (Right edge) + Buffer
            // End: -100vw (Left edge) - Buffer? 
            // Better: use explicit VW units to drive it across.

            // Let's go from +100vw to -100vw relative to CENTER.
            // Center is 0. 
            // Start: TranslateX(100vw) -> moves it to the right. 
            // Note: Since we centered it with top:50%/left:50% and typical translate(-50%, -50%), 
            // we need to account for that.
            // Let's handle the positioning purely via transform.
            // A simple approach: 
            // Start X: 120vw
            // End X: -120vw
            const startX = 120; // vw
            const endX = -120; // vw

            const currentX = startX + ((endX - startX) * scrollProgress);

            // Maintain vertical center (-50%) and scale if needed (already set via height)
            // We need translate(-50%, -50%) for centering usually, but here we are moving X.
            // If we use left: 50%, then translate(-50%, ...) centers it.
            // So translate(currentX - 50, -50%) ??
            // Simpler: Just map X.
            // transform: translate(currentXvw, -50%) 

            bgLogoFull.style.transform = `translate(${currentX}vw, -50%)`;
        }

        // --- LIGHT MODE TOGGLE ---
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            const contactTop = contactSection.offsetTop;
            const breakPointLightMode = contactTop - (viewportHeight * 0.8);
            if (scrolled >= breakPointLightMode) {
                document.body.classList.add('light-mode');
            } else {
                document.body.classList.remove('light-mode');
            }
        }

        // --- HEADER LOGIC ---
        // Keep header simple for now: fade out "Start" and fade in "End" based on scroll?
        // Or keep previous logic? Previous logic synced with overall progress.
        // Let's just fade nicely over the first section.
        const logoStart = document.getElementById('logoStart');
        const logoEnd = document.getElementById('logoEnd');
        if (logoStart && logoEnd) {
            const headerProgress = Math.min(scrolled / (viewportHeight * 0.5), 1);
            logoStart.style.opacity = 1 - headerProgress;
            logoEnd.style.opacity = headerProgress;
        }

        // Hide Header in Light Mode Area
        let headerVisible = true;
        if (document.body.classList.contains('light-mode')) {
            headerVisible = false;
        }
        if (header) {
            header.style.opacity = headerVisible ? '1' : '0';
            header.style.pointerEvents = headerVisible ? 'auto' : 'none';
        }
    }

    window.addEventListener('scroll', updateAnimation);
    window.addEventListener('resize', updateAnimation);
    // Initial call
    updateAnimation();

    // Intersection Observer for Text
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
