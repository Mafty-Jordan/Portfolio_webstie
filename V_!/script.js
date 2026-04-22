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

// ── Node Network Background ─────────────────────────────────────────────────
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const PALETTE  = ['#2d7d4e', '#4a9d6f', '#8b5fbf', '#a76fd0'];
    const NODE_N   = 90;
    const MAX_DIST = 155;

    let mouse = { x: -9999, y: -9999 };
    let nodes = [];

    function dist(ax, ay, bx, by) {
        const dx = ax - bx, dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    class Node {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;

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
        }
        ctx.globalAlpha = 1;
    }

    for (let i = 0; i < NODE_N; i++) nodes.push(new Node());

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawEdges();
        nodes.forEach(n => { n.update(); n.draw(); });
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    loop();
}());