import WaveParticles from './index.js';

/**
 * Browser-only entry point for IIFE / script-tag usage.
 * Exposes the WaveParticles class directly on the global object.
 */
if (typeof window !== 'undefined') {
  window.WaveParticles = WaveParticles;
} else if (typeof globalThis !== 'undefined') {
  globalThis.WaveParticles = WaveParticles;
}
