// Particle Animation with Mouse Interaction
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.opacity = Math.random();
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
        this.fadeSpeed = 0.002 + Math.random() * 0.003;
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = 1 + Math.random() * 2;
        this.baseX = this.x;
        this.baseY = this.y;
    }

    update(mouse) {
        // Fade in/out animation
        this.opacity += this.fadeSpeed * this.fadeDirection;

        if (this.opacity >= 1) {
            this.opacity = 1;
            this.fadeDirection = -1;
        } else if (this.opacity <= 0) {
            this.opacity = 0;
            this.fadeDirection = 1;
        }

        // Mouse interaction - particles disappear near mouse
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = mouse.radius;

            if (distance < maxDistance) {
                // Calculate fade based on distance
                const fadeAmount = 1 - (distance / maxDistance);
                this.opacity = Math.max(0, this.opacity - fadeAmount * 0.5);

                // Push particles away from mouse
                const angle = Math.atan2(dy, dx);
                const force = (maxDistance - distance) / maxDistance;
                this.x -= Math.cos(angle) * force * 3;
                this.y -= Math.sin(angle) * force * 3;
            } else {
                // Return to base position
                this.x += (this.baseX - this.x) * 0.05;
                this.y += (this.baseY - this.y) * 0.05;
            }
        }

        // Keep particles in bounds
        if (this.x < 0 || this.x > this.canvas.width ||
            this.y < 0 || this.y > this.canvas.height) {
            this.reset();
        }
    }

    draw(ctx) {
        // Square pixels with gradient
        const gradient = ctx.createLinearGradient(
            this.x - this.size,
            this.y - this.size,
            this.x + this.size,
            this.y + this.size
        );

        gradient.addColorStop(0, `rgba(102, 126, 234, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(118, 75, 162, ${this.opacity})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        // Adjust particle count based on screen size
        const area = this.canvas.width * this.canvas.height;
        this.particleCount = Math.floor(area / 15000);

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        // Mouse move
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Touch events for mobile
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        // Mouse leave - reset mouse position
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ParticleSystem();
    });
} else {
    new ParticleSystem();
}