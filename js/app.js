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
            let endX = -500; // Desktop default (Increased from -270)

            if (window.innerWidth < 768) {
                endX = -850; // Mobile: Aggressive push
            } else if (window.innerWidth <= 1366) { // Expanded definition to catch iPad Pro 12.9" and small laptops
                endX = -1000; // Tablet: Balanced push (between -800 and -1200)
            }

            // Apply Cubic Easing (accelerating) to keep it on screen longer initially
            // Linear movement over such a large distance (-1000vw) makes it disappear too early.
            // Cubed easing starts slow (keeping it visible) and accelerates rapidly at the end.
            const easedProgress = Math.pow(scrollProgress, 3);

            const currentX = startX + ((endX - startX) * easedProgress);

            bgLogo.style.transform = `translate(${currentX}vw, -50%)`;

            // Safety: Ensure it vanishes before white section regardless of width
            // Delayed fade to 0.98 to avoid premature disappearance if animation speed is good
            if (scrollProgress >= 0.98) {
                bgLogo.style.opacity = '0';
                bgLogo.style.transition = 'opacity 0.2s';
            } else {
                bgLogo.style.opacity = '1';
                bgLogo.style.transition = 'none'; // Instant updates during scroll (except the fade)
            }
        }

        // --- THEME LOGIC (White -> Black -> White) ---
        // Section 1 (Hero): White (Default)
        // Section 2..N: Black (Dark Mode)
        // Section 7 (Contact): White (Default)

        const section2 = document.getElementById('chapter-why-now');
        // const contactSection = document.querySelector('.contact-section'); // Already defined above

        if (section2) {
            // Trigger Dark Mode slightly before Section 2 starts coming into view?
            // Or when it hits a certain point. User said "Ab der zweiten" (From the second one).
            // Let's say when Section 2 crosses 60% viewport or top.
            const s2Trigger = section2.offsetTop - (viewportHeight * 0.5);

            let contactTrigger = 999999;
            if (contactSection) {
                contactTrigger = contactSection.offsetTop - (viewportHeight * 0.8);
            }

            if (scrolled >= s2Trigger && scrolled < contactTrigger) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
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
