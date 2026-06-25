export interface WaveConfig {
  /** Peak-to-trough height of the sine wave in pixels. @default 60 */
  amplitude?: number;
  /** Spatial frequency (radians per pixel). Higher = tighter waves. @default 0.003 */
  frequency?: number;
  /** Temporal speed multiplier for animation. Higher = faster oscillation. @default 0.006 */
  speed?: number;
  /** Vertical position as a fraction of canvas height (0–1). @default 0.55 */
  yOffset?: number;
  /** Fill color with alpha for the wave layer. @default 'rgba(248, 225, 231, 0.25)' */
  color?: string;
  /** Stroke width. @default 1.5 */
  lineWidth?: number;
  /** How strongly mouse proximity displaces the wave vertically. @default 0.45 */
  mouseInfluence?: number;
  /** Number of visual layers to render for this wave definition. @default 2 */
  layers?: number;
}

export interface ParticlesConfig {
  /** Pixels per particle slot (lower = more particles). @default 8000 */
  countScale?: number;
  /** Hard cap on total particles regardless of canvas size. @default 180 */
  maxCount?: number;
}

export interface ColorsConfig {
  /** Radial gradient stops for the background. @default ['#fdfcfb', '#f7ede2', '#e8d5d0'] */
  backgroundGradient?: string[];
  /** RGBA prefix strings (e.g. 'rgba(248, 225, 231,'). */
  particleColorPrefixes?: string[];
  /** Stops for the mouse-glow radial gradient. */
  mouseGlowStops?: Array<{ offset: number; color: string }>;
}

export interface WaveParticlesConfig {
  /** Array of wave configurations. */
  waves?: WaveConfig[];
  /** Particle system settings. */
  particles?: ParticlesConfig;
  /** Color palette settings. */
  colors?: ColorsConfig;
}

export interface WaveParticlesOptions {
  /** Existing canvas element, CSS selector, or null to auto-create. */
  canvas?: HTMLCanvasElement | string | null;
  /** Animation configuration overrides. */
  config?: WaveParticlesConfig;
}

declare class WaveParticles {
  /**
   * Create a new WaveParticles instance.
   * @param options Configuration options
   */
  constructor(options?: WaveParticlesOptions);

  /**
   * Resumes the animation loop if stopped.
   */
  start(): void;

  /**
   * Pauses the animation loop.
   */
  stop(): void;

  /**
   * Recalculates dimensions and redistributes particles.
   * Useful if the canvas container size changes manually.
   */
  resize(): void;

  /**
   * Initializes or re-initializes particles.
   * Useful if you want to force-refresh the particle system after config changes.
   */
  initParticles(): void;

  /**
   * Stops the animation and removes the auto-generated canvas from the DOM.
   */
  destroy(): void;
}

export default WaveParticles;
