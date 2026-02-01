document.addEventListener('DOMContentLoaded', () => {

    console.log('Aachen ohne Limits - Loaded');

    // DOM Elements
    const bgLogoFull = document.getElementById('bgLogoFull'); // Hide this
    const bgLogo = document.getElementById('bgLogo'); // Animate this one (ac.svg)
    const header = document.querySelector('.header');

    // Config
    const LOGO_HEIGHT_VH = 180; // User Request: Increased to 180vh

    // Initial Setup
    if (bgLogoFull) bgLogoFull.style.display = 'none';
    if (bgLogo) {
        bgLogo.style.opacity = '1';
        bgLogo.style.display = 'block';
        bgLogo.style.height = `${LOGO_HEIGHT_VH}vh`;
        bgLogo.style.width = 'auto';
        bgLogo.style.position = 'fixed';
        bgLogo.style.top = '50%';
        bgLogo.style.left = '50%';
        // We will animate separate transform
    }

    function updateAnimation() {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;

        // Determine Animation End Point (Start of White Section)
        const contactSection = document.querySelector('.contact-section');
        let animationEndScroll = document.documentElement.scrollHeight - viewportHeight; // Fallback

        if (contactSection) {
            // End animation slightly before the white section starts fully
            // The white section triggers 'light-mode' at breakPointLightMode. 
            // The background turns white at 'breakPointLightMode' (contactTop - 80vh).
            animationEndScroll = contactSection.offsetTop - (viewportHeight * 0.8);
        }

        // 0 to 1 progress relative to the Dark Zone
        const scrollProgress = Math.max(0, Math.min(scrolled / animationEndScroll, 1));

        // --- BACKGROUND LOGO ANIMATION (Simple Flythrough) ---
        if (bgLogo) {
            // "Right out of picture" to "Left out of picture"
            const startX = 60; // vw

            // Responsive Exit Positions
            let endX = -270; // Desktop default

            if (window.innerWidth < 768) {
                endX = -850; // Mobile: Aggressive push
            } else if (window.innerWidth <= 1024) {
                endX = -1200; // Tablet: Very aggressive push (User request)
            }

            const currentX = startX + ((endX - startX) * scrollProgress);

            bgLogo.style.transform = `translate(${currentX}vw, -50%)`;
        }

        // --- LIGHT MODE TOGGLE ---
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
