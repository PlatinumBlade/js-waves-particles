/**
 * js-waves-particles
 * A canvas-based wave and particle animation library with mouse-reactive effects.
 * Developed by Luis 'PlatinumBlade' Moniz.
 */

class WaveParticles {
    /**
     * Initializes a new WaveParticles animation engine.
     *
     * @param {import('./index').WaveParticlesOptions} [options] - Configuration for the engine.
     * @param {HTMLCanvasElement|string} [options.canvas] - The target canvas element or a CSS selector (e.g., '#bg'). If omitted, a full-screen fixed canvas is automatically created.
     * @param {import('./index').WaveParticlesConfig} [options.config] - Visual parameters for waves, particles, and colors.
     */
    constructor(options = {}) {
        const {canvas: providedCanvasOrSelector, config} = options || {};

        // --- State ---
        this.canvas = null;
        this.ctx = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = -1000;
        this.targetMouseY = -1000;
        this.mouseActive = false;
        this.width = 0;
        this.height = 0;
        this.config = this._mergeDefaults(config || {});
        this.time = 0;
        this.isRunning = false;
        this.particles = [];
        this._resizeTimeout = null;

        const resolvedCanvas = typeof document !== 'undefined' && providedCanvasOrSelector ? (() => {
            if (typeof providedCanvasOrSelector === 'string') {
                return /** @type {HTMLCanvasElement|null} */ (document.querySelector(providedCanvasOrSelector));
            }

            return /** @type {HTMLCanvasElement | null} */ (providedCanvasOrSelector);
        })() : null;

        if (resolvedCanvas) {
            this.canvas = resolvedCanvas;
            const rect = resolvedCanvas.getBoundingClientRect();
            this.width = Math.round(rect.width || window.innerWidth);
            this.height = Math.round(rect.height || window.innerHeight);
        } else {
            this._createAutoCanvas();
        }

        try {
            if (!this.canvas) {
                throw new Error('No canvas element available.');
            }

            const ctx = this.canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get 2D rendering context.');
            }

            this.ctx = ctx;
        } catch (e) {
            console.error('[WaveParticles] Canvas error:', e);
            return;
        }

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._onResize = this._onResize.bind(this);

        if (typeof document !== 'undefined') {
            window.addEventListener('resize', this._onResize);
            this.resize(); // Initial size setup
        }

        this.initParticles();
        this.start();
    }

    /**
     * Internal method to merge user configuration with library defaults.
     * @private
     */
    _mergeDefaults(userConfig) {
        const defaults = {
            waves: [
                {
                    amplitude: 60,
                    frequency: 0.003,
                    speed: 0.006,
                    yOffset: 0.55,
                    color: 'rgba(248, 225, 231, 0.25)',
                    lineWidth: 1.5,
                    mouseInfluence: 0.45
                },
                {
                    amplitude: 50,
                    frequency: 0.004,
                    speed: 0.008,
                    yOffset: 0.60,
                    color: 'rgba(212, 165, 165, 0.2)',
                    lineWidth: 1,
                    mouseInfluence: 0.5
                },
                {
                    amplitude: 70,
                    frequency: 0.0025,
                    speed: 0.005,
                    yOffset: 0.65,
                    color: 'rgba(255, 255, 255, 0.2)',
                    lineWidth: 1.5,
                    mouseInfluence: 0.4
                },
                {
                    amplitude: 40,
                    frequency: 0.0035,
                    speed: 0.010,
                    yOffset: 0.70,
                    color: 'rgba(201, 169, 110, 0.12)',
                    lineWidth: 1,
                    mouseInfluence: 0.55
                }
            ],
            particles: {countScale: 8000, maxCount: 180},
            colors: {
                backgroundGradient: ['#fdfcfb', '#f7ede2', '#e8d5d0'],
                particleColorPrefixes: [
                    'rgba(248, 225, 231,',
                    'rgba(212, 165, 165,',
                    'rgba(201, 169, 110,',
                    'rgba(255, 255, 255,',
                    'rgba(232, 213, 208,'
                ],
                mouseGlowStops: [
                    {offset: 0, color: 'rgba(255, 255, 255, 0.08)'},
                    {offset: 0.5, color: 'rgba(248, 225, 231, 0.04)'},
                    {offset: 1, color: 'rgba(248, 225, 231, 0)'}
                ]
            }
        };

        const result = {};

        for (const key in defaults) {
            if (!defaults.hasOwnProperty(key)) {
                continue;
            }

            if (!(userConfig && userConfig[key])) {
                result[key] = JSON.parse(JSON.stringify(defaults[key]));
            } else if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && typeof userConfig[key] === 'object') {
                result[key] = Object.assign({}, defaults[key], userConfig[key]);
            } else if (key === 'waves') {
                result.waves = Array.isArray(userConfig.waves) ? [...userConfig.waves] : JSON.parse(JSON.stringify(defaults.waves));
            } else {
                result[key] = userConfig[key];
            }
        }
        
        return result;
    }

    /**
     * Automatically creates and injects a canvas element into the DOM if none was provided.
     * @private
     */
    _createAutoCanvas() {
        if (typeof document === 'undefined') {
            return;
        }

        const el = document.createElement('canvas');

        el.id = 'wave-particles-canvas';

        Object.assign(el.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            pointerEvents: 'none'
        });

        const body = document.body;

        if (!body) {
            return;
        }

        body.insertBefore(el, body.firstChild);
        this.canvas = el;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    /**
     * Event handler for window resize events, including debouncing to prevent performance issues.
     * @private
     */
    _onResize() {
        if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
        // Debounce resize to prevent flashing and high CPU usage
        this._resizeTimeout = setTimeout(() => {
            this.resize();
        }, 250);
    }

    /**
     * Recalculates canvas dimensions based on its display size and Device Pixel Ratio.
     * Re-initializes particles to match the new surface area.
     */
    resize() {
        if (!this.canvas) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();

        let w, h;

        const attrW = parseInt(this.canvas.getAttribute('width'), 10);
        const attrH = parseInt(this.canvas.getAttribute('height'), 10);

        if (attrW && attrH) {
            w = Math.round(rect.width || attrW);
            h = Math.round(rect.height || attrH);
        } else {
            w = window.innerWidth;
            h = window.innerHeight;

            if (!this.canvas.parentNode && document.body) {
                document.body.insertBefore(this.canvas, document.body.firstChild);
            }
        }
        
        this.width = w;
        this.height = h;

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = Math.round(w * dpr);
        this.canvas.height = Math.round(h * dpr);

        if (this.ctx && this.isRunning) {
            this.initParticles();
        }
    }

    /**
     * Generates a new set of particles based on the current canvas area and configuration.
     */
    initParticles() {
        const {countScale = 8000, maxCount = 180} = this.config.particles;

        const particleCount = Math.min(Math.floor((this.width * this.height) / (countScale > 0 ? countScale : 8000)), maxCount);

        this.particles = Array.from({length: particleCount}, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 4 + 1.5,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.6 + 0.3,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.025 + 0.01,
            colorPrefix: this.config.colors.particleColorPrefixes[Math.floor(Math.random() * this.config.colors.particleColorPrefixes.length)]
        }));
    }

    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        if (!rect) {
            return;
        }

        // Calculate position relative to the canvas in CSS pixels
        this.targetMouseX = e.clientX - rect.left;
        this.targetMouseY = e.clientY - rect.top;
        this.mouseActive = true;
    }

    _onMouseLeave() {
        this.mouseActive = false;
    }

    _onTouchMove(e) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        if (!touch || !rect) {
            return;
        }

        this.targetMouseX = touch.clientX - rect.left;
        this.targetMouseY = touch.clientY - rect.top;
        this.mouseActive = true;
    }

    _onTouchEnd() {
        this.mouseActive = false;
    }

    /**
     * Renders the radial gradient background across the entire canvas.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawBackground(ctx) {
        const colors = this.config.colors.backgroundGradient;
        
        const gradient = ctx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8);
        
        colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1 || 1), c));
        
        ctx.fillStyle = gradient;
        
        ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Renders all wave layers, accounting for mouse interaction and layer offsets.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawWaves(ctx) {
        const mouseNormX = this.mouseActive ? this.mouseX / this.width : -1;
        const mouseNormY = this.mouseActive ? this.mouseY / this.height : -1;

        for (let wi = 0; wi < this.config.waves.length; wi++) {
            const wave = this.config.waves[wi];
            const numLayers = Math.max(2, wave.layers || 2);

            for (let layer = 0; layer < numLayers; layer++) {
                const layerOpacity = (1 - layer / numLayers) * 0.5 + 0.5;
                
                ctx.beginPath();
                
                const baseY = this.height * wave.yOffset + layer * 3;
                
                const mouseEffect = this.mouseActive ? (mouseNormX - 0.5) * (wave.mouseInfluence || 0.45) * 150 : 0;
                
                ctx.moveTo(0, this.height);

                const step = Math.max(2, Math.floor(this.width / 480));
                
                for (let x = 0; x <= this.width; x += step) {
                    let y = baseY;
                    
                    y += Math.sin(x * wave.frequency + this.time * wave.speed + layer * 0.1) * wave.amplitude;
                    y += Math.sin(x * wave.frequency * 1.5 + this.time * wave.speed * 0.7 + wi) * wave.amplitude * 0.3;
                    
                    if (this.mouseActive) {
                        const dx = x - this.mouseX;
                        const dist = Math.abs(dx) / this.width;
                        y += Math.sin(dist * Math.PI) * (mouseNormY > 0 ? (this.mouseY - this.height / 2) : 0) * 0.1 * (wave.mouseInfluence || 0.45);
                    }
                    
                    y += mouseEffect * Math.sin((x / this.width) * Math.PI);
                    
                    ctx.lineTo(x, y);
                }
                
                ctx.lineTo(this.width, this.height);
                
                ctx.closePath();
                
                const baseColor = wave.color || 'rgba(139, 114, 86, 0.25)';
                
                ctx.fillStyle = baseColor.replace(/([\d.]+)\)$/, (m) => `${parseFloat(m) * layerOpacity})`);
                
                if (wave.lineWidth != null) {
                    ctx.lineWidth = wave.lineWidth;
                }
                
                ctx.fill();
            }
        }
    }

    /**
     * Updates and renders the particle system, including movement and mouse repulsion logic.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawParticles(ctx) {
        const maxDist = 150;
        
        for (const p of this.particles) {
            p.pulse += p.pulseSpeed;
            
            const currentOpacity = p.opacity * (Math.sin(p.pulse) * 0.3 + 0.7);
            
            if (this.mouseActive) {
                const dx = p.x - this.mouseX, dy = p.y - this.mouseY, dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < maxDist && dist > 0.1) {
                    const force = (1 - dist / maxDist) * 2;
                    p.x += (dx / dist) * force;
                    p.y += (dy / dist) * force;
                }
            }
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) {
                p.x = this.width;
            }
            
            if (p.x > this.width) {
                p.x = 0;
            }
            
            if (p.y < 0) {
                p.y = this.height;
            }
            
            if (p.y > this.height) {
                p.y = 0;
            }

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            
            grad.addColorStop(0, p.colorPrefix + currentOpacity + ')');
            
            grad.addColorStop(1, p.colorPrefix + '0)');
            
            ctx.beginPath();
            
            ctx.fillStyle = grad;
            
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            
            ctx.fill();
            
            ctx.beginPath();
            
            ctx.fillStyle = p.colorPrefix + (currentOpacity * 0.8) + ')';
            
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            
            ctx.fill();
        }
    }

    /**
     * Renders a soft glow effect centered at the current mouse position.
     * @param {CanvasRenderingContext2D} ctx
     */
    drawMouseGlow(ctx) {
        if (!this.mouseActive) {
            return;
        }
        
        const gradient = ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, 200);
        
        const stops = this.config.colors.mouseGlowStops;
        
        stops.forEach((s) => gradient.addColorStop(s.offset, s.color));
        
        ctx.beginPath();
        
        ctx.fillStyle = gradient;
        
        ctx.arc(this.mouseX, this.mouseY, 200, 0, Math.PI * 2);
        
        ctx.fill();
    }

    /**
     * The main animation loop. Updates state and draws the next frame.
     */
    animate() {
        if (!this.ctx) {
            return;
        }
        
        this.time += 1;
        
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground(this.ctx);
        this.drawWaves(this.ctx);
        this.drawParticles(this.ctx);
        this.drawMouseGlow(this.ctx);
        
        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }

    /**
     * Starts or resumes the animation loop and attaches interaction listeners.
     */
    start() {
        if (this.isRunning) {
            return;
        }
        
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', this._onMouseMove, {passive: true});
            window.addEventListener('touchmove', this._onTouchMove, {passive: false});
            window.addEventListener('touchend', this._onTouchEnd, {passive: true});
            window.addEventListener('mouseleave', this._onMouseLeave);
        }
        
        this.isRunning = true;
        
        this.animate();
    }

    /**
     * Pauses the animation loop and detaches interaction listeners to save resources.
     */
    stop() {
        this.isRunning = false;
        
        if (typeof window !== 'undefined') {
            window.removeEventListener('mousemove', this._onMouseMove);
            window.removeEventListener('touchmove', this._onTouchMove);
            window.removeEventListener('touchend', this._onTouchEnd);
            window.removeEventListener('mouseleave', this._onMouseLeave);
        }
    }

    /**
     * Stops the animation, removes event listeners, and cleans up any auto-injected DOM elements.
     */
    destroy() {
        this.stop();
        
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this._onResize);
        }
        
        if (this.canvas && this.canvas.id === 'wave-particles-canvas' && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.canvas = null;
        this.ctx = null;
    }
}

export default WaveParticles;
