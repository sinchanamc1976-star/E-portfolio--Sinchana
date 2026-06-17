/* 
 * Script: Consolidated JavaScript Engine containing Canvas Space Background, 
 * Parallax Scroll interpolator, and dynamic 3D Orbiting Skills.
 * Author: Sinchana M C
 */

// ==========================================
// 1. CANVAS PARTICLE SYSTEM (COSMICSPACE)
// ==========================================
class CosmicSpace {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.stars = [];
        this.ambientParticles = [];
        this.shootingStars = [];
        
        // Settings
        this.maxStars = 150;
        this.maxAmbient = 45;
        this.shootingStarChance = 0.005; 
        
        this.colors = {
            primary: '#6C63FF',
            secondary: '#00D9FF',
            accent: '#A855F7',
            star: '#FFFFFF'
        };

        this.mouse = { x: -1000, y: -1000, radius: 120 };

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        
        // Initialize stars (twinkling starfield)
        this.stars = [];
        for (let i = 0; i < this.maxStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                twinkleSpeed: 0.005 + Math.random() * 0.015,
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Initialize ambient gas particles
        this.ambientParticles = [];
        for (let i = 0; i < this.maxAmbient; i++) {
            this.ambientParticles.push(this.createAmbientParticle(true));
        }
    }

    createAmbientParticle(randomY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 20,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.4 + 0.1,
            vy: -(Math.random() * 0.5 + 0.2),
            alpha: 0,
            maxAlpha: Math.random() * 0.5 + 0.2,
            fadeInSpeed: 0.005 + Math.random() * 0.01,
            fadeOutSpeed: 0.005 + Math.random() * 0.01,
            state: 'fadeIn',
            color: Math.random() > 0.5 ? this.colors.secondary : this.colors.accent
        };
    }

    triggerShootingStar() {
        if (this.shootingStars.length >= 2) return;
        
        const startX = Math.random() * (this.canvas.width * 0.8);
        const startY = Math.random() * (this.canvas.height * 0.4);
        const length = Math.random() * 80 + 50;
        const angle = Math.PI / 6 + (Math.random() * Math.PI / 12);
        const speed = Math.random() * 12 + 8;
        
        this.shootingStars.push({
            x: startX,
            y: startY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            len: length,
            thickness: Math.random() * 1.5 + 1,
            color: this.colors.secondary,
            alpha: 1,
            decay: 0.015 + Math.random() * 0.015
        });
    }

    spawnSkillBurst(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1.5;
            this.ambientParticles.push({
                x: x,
                y: y,
                size: Math.random() * 1.5 + 0.8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                maxAlpha: 0.8,
                fadeInSpeed: 0.1,
                fadeOutSpeed: 0.02 + Math.random() * 0.02,
                state: 'fadeOut',
                color: Math.random() > 0.5 ? this.colors.secondary : this.colors.accent
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    drawStars() {
        this.ctx.fillStyle = this.colors.star;
        for (let star of this.stars) {
            star.alpha += star.twinkleSpeed * star.twinkleDirection;
            if (star.alpha >= 1) {
                star.alpha = 1;
                star.twinkleDirection = -1;
            } else if (star.alpha <= 0.1) {
                star.alpha = 0.1;
                star.twinkleDirection = 1;
            }

            this.ctx.beginPath();
            this.ctx.globalAlpha = star.alpha;
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawAmbientParticles() {
        for (let p of this.ambientParticles) {
            p.x += p.vx;
            p.y += p.vy;

            if (this.mouse.x !== -1000) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    p.x += (dx / distance) * force * 1.5;
                    p.y += (dy / distance) * force * 1.5;
                }
            }

            if (p.state === 'fadeIn') {
                p.alpha += p.fadeInSpeed;
                if (p.alpha >= p.maxAlpha) {
                    p.alpha = p.maxAlpha;
                    p.state = 'active';
                }
            } else if (p.state === 'active') {
                if (Math.random() < 0.005) p.state = 'fadeOut';
            } else if (p.state === 'fadeOut') {
                p.alpha -= p.fadeOutSpeed;
                if (p.alpha <= 0) {
                    p.alpha = 0;
                    Object.assign(p, this.createAmbientParticle(false));
                }
            }

            if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                Object.assign(p, this.createAmbientParticle(false));
            }

            this.ctx.beginPath();
            this.ctx.globalAlpha = p.alpha;
            
            const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            this.ctx.fillStyle = grad;
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            let s = this.shootingStars[i];
            s.x += s.dx;
            s.y += s.dy;
            s.alpha -= s.decay;

            if (s.alpha <= 0) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.lineWidth = s.thickness;
            
            const grad = this.ctx.createLinearGradient(s.x, s.y, s.x - s.dx * 1.5, s.y - s.dy * 1.5);
            grad.addColorStop(0, s.color);
            grad.addColorStop(0.3, 'rgba(0, 217, 255, 0.4)');
            grad.addColorStop(1, 'rgba(108, 99, 255, 0)');
            
            this.ctx.strokeStyle = grad;
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x - s.dx * 1.5, s.y - s.dy * 1.5);
            this.ctx.stroke();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (Math.random() < this.shootingStarChance) {
            this.triggerShootingStar();
        }

        this.drawStars();
        this.drawAmbientParticles();
        this.drawShootingStars();
        
        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// 2. PARALLAX ENGINGE (PARALLAXENGINE)
// ==========================================
class ParallaxEngine {
    constructor() {
        this.targetScroll = 0;
        this.currentScroll = 0;
        this.ease = 0.075; 

        // Cache elements
        this.canvas = document.getElementById('bg-canvas');
        this.nebula1 = document.getElementById('nebula-1');
        this.nebula2 = document.getElementById('nebula-2');
        this.aiCore = document.querySelector('.ai-core-container');
        this.floatingContainer = document.getElementById('floating-objects');
        
        this.shapes = {
            cube: document.querySelector('.float-shape.cube'),
            ring: document.querySelector('.float-shape.ring-shape'),
            hex: document.querySelector('.float-shape.hexagon-shape'),
            sphere: document.querySelector('.float-shape.sphere-shape')
        };
        
        this.sections = document.querySelectorAll('.section');
        this.revealElements = document.querySelectorAll('.scroll-reveal');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.tick();
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            this.targetScroll = window.scrollY;
        }, { passive: true });

        this.targetScroll = window.scrollY;
        this.currentScroll = window.scrollY;
    }

    tick() {
        this.currentScroll += (this.targetScroll - this.currentScroll) * this.ease;
        
        if (Math.abs(this.targetScroll - this.currentScroll) < 0.05) {
            this.currentScroll = this.targetScroll;
        }

        this.applyTransforms();
        this.checkReveals();

        requestAnimationFrame(() => this.tick());
    }

    applyTransforms() {
        const scroll = this.currentScroll;
        const h = window.innerHeight;

        // Layer 1 (Starfield Canvas) - 10% depth speed
        if (this.canvas) {
            this.canvas.style.transform = `translate3d(0, ${-scroll * 0.1}px, 0)`;
        }

        // Layer 2 (Nebula Clouds) - 20% depth speed
        if (this.nebula1) {
            this.nebula1.style.transform = `translate3d(${scroll * 0.04}px, ${-scroll * 0.2}px, 0) rotate(${scroll * 0.015}deg)`;
        }
        if (this.nebula2) {
            this.nebula2.style.transform = `translate3d(${-scroll * 0.04}px, ${-scroll * 0.18}px, 0) rotate(${-scroll * 0.01}deg)`;
        }

        // Layer 5 (AI Core Backdrop) - 55% depth speed
        if (this.aiCore) {
            if (scroll < h * 1.5) {
                const yOffset = -scroll * 0.55;
                const scale = Math.max(0.4, 1 - (scroll / h) * 0.35);
                const opacity = Math.max(0, 1 - (scroll / h) * 1.2);
                
                this.aiCore.style.transform = `translate3d(-50%, calc(-50% + ${yOffset}px), 0) scale(${scale})`;
                this.aiCore.style.opacity = opacity;
            }
        }

        // Layer 4 (Floating Shapes) - ~45% speed
        if (!this.isMobileDevice()) {
            if (this.shapes.cube) {
                this.shapes.cube.style.transform = `translate3d(0, ${-scroll * 0.40}px, 0) rotateX(${45 + scroll * 0.05}deg) rotateY(${45 + scroll * 0.05}deg)`;
            }
            if (this.shapes.ring) {
                this.shapes.ring.style.transform = `translate3d(0, ${-scroll * 0.48}px, 0) rotateY(${scroll * 0.08}deg)`;
            }
            if (this.shapes.hex) {
                this.shapes.hex.style.transform = `translate3d(0, ${-scroll * 0.42}px, 0) rotateZ(${scroll * 0.06}deg)`;
            }
            if (this.shapes.sphere) {
                this.shapes.sphere.style.transform = `translate3d(0, ${-scroll * 0.45}px, 0)`;
            }
        }
    }

    checkReveals() {
        const triggerPoint = window.innerHeight * 0.82;

        this.revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < triggerPoint) {
                el.classList.add('active');
                
                if (el.id === 'education') {
                    const line = el.querySelector('.timeline-line');
                    if (line) line.classList.add('active');
                    
                    const items = el.querySelectorAll('.timeline-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('active');
                        }, index * 250);
                    });
                }
            }
        });

        // Track active navigation links based on current section
        let currentSectionId = 'hero';
        this.sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    isMobileDevice() {
        return window.innerWidth <= 768;
    }
}

// ==========================================
// 3. CORE LOGIC & SKILLS ORBIT INITIALIZER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // A. Start Canvas cosmic background
    window.cosmicBackground = new CosmicSpace('bg-canvas');

    // B. Start Parallax engine
    window.parallaxEngine = new ParallaxEngine();

    // C. Mobile Navigation Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    // Header opacity on scroll scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // D. Cursor Mouse Glow Chase logic
    const mouseGlow = document.getElementById('mouse-glow');
    let mouseX = -1000, mouseY = -1000;
    let glowX = -1000, glowY = -1000;
    let firstMove = false;

    window.addEventListener('mousemove', (e) => {
        if (!firstMove) {
            firstMove = true;
            if (mouseGlow) mouseGlow.style.opacity = '1';
        }
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        if (mouseGlow) mouseGlow.style.opacity = '0';
        firstMove = false;
        mouseX = -1000;
        mouseY = -1000;
    });

    function updateGlowPosition() {
        if (firstMove && mouseGlow) {
            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;
            mouseGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(updateGlowPosition);
    }
    updateGlowPosition();

    // E. 3D Card mouse tilt physics
    const tiltCards = document.querySelectorAll('.card-tilt');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const rotX = -((y - h/2) / (h/2)) * 12;
            const rotY = ((x - w/2) / (w/2)) * 12;
            
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });

    // F. Concentric Orbiting Skills System
    const orbitNodesWrapper = document.getElementById('orbit-nodes');
    
    const skillList = [
        // Orbit 1: Python, C, HTML, CSS, JavaScript (Radius: 125px)
        { name: 'Python', orbit: 1, angle: 0, speed: 0.012 },
        { name: 'C', orbit: 1, angle: (2 * Math.PI) / 5, speed: 0.012 },
        { name: 'HTML', orbit: 1, angle: (4 * Math.PI) / 5, speed: 0.012 },
        { name: 'CSS', orbit: 1, angle: (6 * Math.PI) / 5, speed: 0.012 },
        { name: 'JavaScript', orbit: 1, angle: (8 * Math.PI) / 5, speed: 0.012 },
        
        // Orbit 2: ML, Data Science, NumPy, Pandas (Radius: 220px)
        { name: 'Machine Learning', orbit: 2, angle: 0, speed: -0.008 },
        { name: 'Data Science', orbit: 2, angle: Math.PI / 2, speed: -0.008 },
        { name: 'NumPy', orbit: 2, angle: Math.PI, speed: -0.008 },
        { name: 'Pandas', orbit: 2, angle: (3 * Math.PI) / 2, speed: -0.008 },
        
        // Orbit 3: Git, GitHub, VS Code (Radius: 305px)
        { name: 'Git', orbit: 3, angle: 0, speed: 0.006 },
        { name: 'GitHub', orbit: 3, angle: (2 * Math.PI) / 3, speed: 0.006 },
        { name: 'VS Code', orbit: 3, angle: (4 * Math.PI) / 3, speed: 0.006 }
    ];

    const orbitsSettings = {
        1: { rx: 125, ry: 50 },  
        2: { rx: 220, ry: 85 },  
        3: { rx: 305, ry: 120 }  
    };

    const containerCenter = { x: 325, y: 325 }; 
    let hoveredSkill = null;

    if (orbitNodesWrapper) {
        skillList.forEach(skill => {
            const bubble = document.createElement('div');
            bubble.classList.add('skill-bubble');
            bubble.textContent = skill.name;
            orbitNodesWrapper.appendChild(bubble);
            
            skill.el = bubble;

            bubble.addEventListener('mouseenter', () => {
                hoveredSkill = skill;
                
                if (window.cosmicBackground) {
                    const rect = bubble.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    window.cosmicBackground.spawnSkillBurst(centerX, centerY);
                }
            });

            bubble.addEventListener('mouseleave', () => {
                hoveredSkill = null;
            });
        });

        function animateSkills() {
            skillList.forEach(skill => {
                if (hoveredSkill !== skill) {
                    skill.angle += skill.speed;
                }

                const settings = orbitsSettings[skill.orbit];
                const x = containerCenter.x + Math.cos(skill.angle) * settings.rx;
                const y = containerCenter.y + Math.sin(skill.angle) * settings.ry;

                const zVal = Math.sin(skill.angle);
                
                const scale = 0.82 + (zVal + 1) * 0.12; 
                const opacity = 0.45 + (zVal + 1) * 0.275;
                const zIndex = Math.floor(10 + (zVal + 1) * 10);

                if (skill.el) {
                    skill.el.style.left = `${x}px`;
                    skill.el.style.top = `${y}px`;
                    
                    if (hoveredSkill === skill) {
                        skill.el.style.transform = `translate(-50%, -50%) scale(1.15)`;
                        skill.el.style.opacity = '1';
                        skill.el.style.zIndex = '35';
                    } else {
                        skill.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
                        skill.el.style.opacity = `${opacity}`;
                        skill.el.style.zIndex = `${zIndex}`;
                    }
                }
            });

            requestAnimationFrame(animateSkills);
        }

        animateSkills();
    }
});
