document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    const container = document.querySelector('.intro-container');
    const skipBtn = document.getElementById('intro-skip');

    // Configuration
    const HEART_COUNT = 30; // Number of hearts
    const ANIMATION_DURATION = 6000; // Total ms (failsafe)

    let hearts = [];
    let isSkipped = false;

    // Heart shapes/emojis to try
    const HEART_TYPES = ['❤️', '💖', '💗', '💓', '💞'];

    // 1. Initialize Hearts
    function createHearts() {
        for (let i = 0; i < HEART_COUNT; i++) {
            const heart = document.createElement('div');
            heart.classList.add('intro-heart');
            heart.innerText = HEART_TYPES[Math.floor(Math.random() * HEART_TYPES.length)];

            // Randomize size
            const size = Math.floor(Math.random() * 20) + 15; // 15px to 35px
            heart.style.fontSize = `${size}px`;

            // Start position (random scattered at bottom)
            const startX = Math.random() * 100; // vw
            const startY = 110; // vh (below screen)

            heart.style.left = `${startX}vw`;
            heart.style.top = `${startY}vh`;

            container.appendChild(heart);
            hearts.push({
                el: heart,
                x: startX,
                y: startY,
                size: size,
                speed: Math.random() * 0.5 + 0.5,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    // 2. Animation Logic
    // We'll use CSS transitions for smooth movement where possible, but requestAnimationFrame is better for complex paths.
    // Implementation: 
    // Phase A: Float Up (0s - 2s)
    // Phase B: Gather to Heart Shape (2s - 4s)
    // Phase C: Hold (4s - 5.5s)
    // Phase D: Scatter/Fade (5.5s+)

    let startTime = null;

    function animate(timestamp) {
        if (isSkipped) return;
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;

        // Phase 1: Floating Up
        if (progress < 2500) {
            hearts.forEach((h, i) => {
                // Move up
                h.y -= h.speed * 0.8;
                // Side to side wobble
                const wobble = Math.sin(progress * 0.002 + h.wobble) * 0.5;

                // Update DOM
                h.el.style.top = `${h.y}vh`;
                h.el.style.left = `${h.x + wobble}vw`;
                h.el.style.opacity = Math.min(1, (progress / 500)); // Fade in
                h.el.style.transform = `rotate(${wobble * 10}deg)`;
            });
            requestAnimationFrame(animate);
        }
        // Phase 2: Form Heart Shape
        else if (progress < 4500) {
            // Calculate target positions for heart shape
            // Center of screen is 50vw, 50vh

            const t = (progress - 2500) / 2000; // 0 to 1
            const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in out

            hearts.forEach((h, i) => {
                // Target calculation
                // Parametric heart: 
                // x = 16sin^3(t)
                // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
                // Angle spread for hearts
                const angle = (i / HEART_COUNT) * Math.PI * 2;

                // Scale factor for the heart shape size
                const scale = 1.2;

                let tx = 16 * Math.pow(Math.sin(angle), 3);
                let ty = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));

                // Normalize and position at center
                // Current x/y (approximate from last frame of phase 1 for smoothness? 
                // Ideally we interpolate from current pos to target pos)

                // Let's just interpolate from "current floating pos" to "target pos"
                // But "current pos" changes if we kept floating. 
                // Let's lock "float pos" at 2500ms equivalent.

                // To keep it simple and performant:
                // We just lerp from wherever they are to the target.

                // Screen Center
                const cx = 50;
                const cy = 45; // Centered vertically since no text

                // Target X/Y in vh/vw (approx)
                const targetX = cx + (tx * scale); // vw roughly
                const targetY = cy + (ty * scale); // vh roughly

                // Lerp
                const currentX = h.x + (Math.sin(2500 * 0.002 + h.wobble) * 0.5); // approx pos at end of phase 1
                const currentY = h.y; // approx pos at end of phase 1 (it kept moving up)

                // Actually, let's catch them from wherever they are currently?
                // Simpler: Just Interpolate.

                const finalX = currentX + (targetX - currentX) * ease;
                const finalY = currentY + (targetY - currentY) * ease;

                h.el.style.left = `${finalX}vw`;
                h.el.style.top = `${finalY}vh`;
                h.el.style.transform = `scale(${1 + ease * 0.2})`; // Pulse slightly
            });

            requestAnimationFrame(animate);
        }
        // Phase 3: Hold
        else if (progress < 6000) {
            // Just wait, maybe subtle pulse for hearts if we want, but currently fine to just hold

            requestAnimationFrame(animate);
        }
        else {
            // End
            finishIntro();
        }
    }

    function finishIntro() {
        if (isSkipped) return;
        isSkipped = true;

        // Scatter hearts
        hearts.forEach(h => {
            h.el.style.transition = 'all 0.8s ease-out';
            h.el.style.opacity = '0';
            h.el.style.transform = `scale(3) rotate(${Math.random() * 360}deg)`;
            h.el.style.left = `${Math.random() * 100}vw`;
            h.el.style.top = `${Math.random() * 100}vh`;
        });

        // Fade overlay
        setTimeout(() => {
            overlay.classList.add('is-hidden');
            // Optional: Remove from DOM after transition
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);
        }, 500);
    }

    // Skip Button
    skipBtn.addEventListener('click', () => {
        isSkipped = true;
        overlay.classList.add('is-hidden');
        setTimeout(() => overlay.style.display = 'none', 1000);
    });

    // Start
    createHearts();
    requestAnimationFrame(animate);
});
