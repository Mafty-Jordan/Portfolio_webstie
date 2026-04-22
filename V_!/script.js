        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe project cards and skill categories
        document.querySelectorAll('.project-card, .skill-category').forEach(el => {
            el.classList.remove('fade-in');
            observer.observe(el);
        });

        // Add active state to nav links on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            document.querySelectorAll('nav a').forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href').slice(1) === current) {
                    link.style.color = 'var(--accent-violet)';
                }
            });
        });

        // Prevent rapid clicks on CTA button
        document.querySelectorAll('.cta-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(btn.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
document.getElementById('year').textContent = new Date().getFullYear();

// ── Panda Node Network Background ──────────────────────────────────────────
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const PALETTE  = ['#2d7d4e', '#4a9d6f', '#8b5fbf', '#a76fd0'];
    const NODE_N   = 90;
    const MAX_DIST = 155;
    const PANDA_R  = 42;

    let panda  = { x: W / 2, y: H / 2 };
    let mouse  = { x: -9999, y: -9999 };
    let nodes  = [];

    function dist(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    class Node {
        constructor() { this.init(); }
        init() {
            // keep nodes away from panda centre on spawn
            do {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
            } while (dist(this.x, this.y, panda.x, panda.y) < PANDA_R + 30);

            const speed = Math.random() * 0.45 + 0.1;
            const angle = Math.random() * Math.PI * 2;
            this.vx    = Math.cos(angle) * speed;
            this.vy    = Math.sin(angle) * speed;
            this.r     = Math.random() * 2.5 + 1.5;
            this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            this.alpha = Math.random() * 0.45 + 0.25;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;

            // gentle mouse repulsion
            const md = dist(this.x, this.y, mouse.x, mouse.y);
            if (md < 110) {
                const f = (110 - md) / 110;
                this.x += ((this.x - mouse.x) / md) * f * 2.5;
                this.y += ((this.y - mouse.y) / md) * f * 2.5;
            }

            // keep clear of panda
            const pd = dist(this.x, this.y, panda.x, panda.y);
            if (pd < PANDA_R + 18) {
                const f = 3;
                this.x += ((this.x - panda.x) / pd) * f;
                this.y += ((this.y - panda.y) / pd) * f;
            }
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function drawEdges() {
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];

            // node ↔ node
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const d = dist(a.x, a.y, b.x, b.y);
                if (d >= MAX_DIST) continue;

                const alpha = (1 - d / MAX_DIST) * 0.38;
                const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                g.addColorStop(0, a.color);
                g.addColorStop(1, b.color);
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = g;
                ctx.lineWidth = 0.9;
                ctx.stroke();
            }

            // node ↔ panda
            const pd = dist(a.x, a.y, panda.x, panda.y);
            const maxPd = MAX_DIST * 1.6;
            if (pd < maxPd) {
                const alpha = (1 - pd / maxPd) * 0.55;
                const g = ctx.createLinearGradient(a.x, a.y, panda.x, panda.y);
                g.addColorStop(0, a.color);
                g.addColorStop(1, 'rgba(232,232,232,0.75)');
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(panda.x, panda.y);
                ctx.strokeStyle = g;
                ctx.lineWidth = 1.3;
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }

    function drawPanda(x, y, r) {
        // halo glow
        const glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.4);
        glow.addColorStop(0, 'rgba(139,95,191,0.18)');
        glow.addColorStop(0.5, 'rgba(45,125,78,0.08)');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // ears (behind face)
        const er = r * 0.37;
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(x + s * r * 0.68, y - r * 0.63, er, 0, Math.PI * 2);
            ctx.fillStyle = '#0f0f0f';
            ctx.fill();
            // inner ear
            ctx.beginPath();
            ctx.arc(x + s * r * 0.68, y - r * 0.63, er * 0.48, 0, Math.PI * 2);
            ctx.fillStyle = '#282828';
            ctx.fill();
        }

        // face base
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ececec';
        ctx.fill();
        // subtle violet ring
        ctx.strokeStyle = 'rgba(139,95,191,0.65)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // eye patches
        for (const s of [-1, 1]) {
            ctx.save();
            ctx.translate(x + s * r * 0.3, y - r * 0.09);
            ctx.scale(0.82, 1.12);
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.265, 0, Math.PI * 2);
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.restore();
        }

        // eyes: white → pupil → shine
        for (const s of [-1, 1]) {
            // sclera
            ctx.beginPath();
            ctx.arc(x + s * r * 0.3, y - r * 0.09, r * 0.125, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            // pupil
            ctx.beginPath();
            ctx.arc(x + s * r * 0.305, y - r * 0.08, r * 0.058, 0, Math.PI * 2);
            ctx.fillStyle = '#060606';
            ctx.fill();
            // catchlight
            ctx.beginPath();
            ctx.arc(x + s * r * 0.32, y - r * 0.105, r * 0.024, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fill();
        }

        // nose
        ctx.save();
        ctx.translate(x, y + r * 0.19);
        ctx.scale(1.35, 0.82);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.095, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.restore();

        // philtrum line
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.24);
        ctx.lineTo(x, y + r * 0.30);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // smile (two curves)
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(x, y + r * 0.30);
            ctx.quadraticCurveTo(
                x + s * r * 0.2,  y + r * 0.42,
                x + s * r * 0.3,  y + r * 0.37
            );
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }

        // cheek blush
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(x + s * r * 0.56, y + r * 0.26, r * 0.18, r * 0.1, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,130,130,0.18)';
            ctx.fill();
        }
    }

    for (let i = 0; i < NODE_N; i++) nodes.push(new Node());

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawEdges();
        nodes.forEach(n => { n.update(); n.draw(); });
        drawPanda(panda.x, panda.y, PANDA_R);
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        panda.x = W / 2;
        panda.y = H / 2;
    });

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    loop();
}());