# js-waves-particles

A lightweight, high-performance canvas animation engine for organic wave and particle effects.

[![NPM Version](https://img.shields.io/npm/v/js-waves-particles)](https://www.npmjs.com/package/js-waves-particles)
[![License](https://img.shields.io/npm/l/js-waves-particles)](https://github.com/PlatinumBlade/js-waves-particles/blob/main/LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/js-waves-particles)](https://bundlephobia.com/package/js-waves-particles)

**[View Live Demo & Playground](https://platinumblade.github.io/js-waves-particles/examples/index.html)**

### [Changelog](./CHANGELOG.md)

## Key Features

- **Multiple Wave Layers**: Smooth, sine-based wave animations with customizable amplitude, frequency, and speed.
- **Floating Particles**: Dynamic particle system with pulsing opacity and mouse-repulsion.
- **Mouse/Touch Reactive**: Waves and particles respond to cursor movements and touch events with smoothed
  interpolation.
- **Fully Customizable**: Override colors, gradients, and animation parameters via a simple config object.
- **Zero Dependencies**: Pure JavaScript, lightweight, and framework-agnostic.
- **Fully Typed**: Shipped with TypeScript definitions for an excellent developer experience.

## Installation

To install the package in your project:

```bash
npm install js-waves-particles
```

## Quick Start

### 1. Modern Bundlers (ESM)

Perfect for React, Vue, Angular, and Next.js.

```javascript
import WaveParticles from 'js-waves-particles';

// Automatically creates a full-screen canvas behind your content
const animation = new WaveParticles();

// Cleanup (important for Single Page Applications)
// animation.destroy();
```

### 2. Browser / Script Tag

```html

<script src="path/to/dist/wave-particles.iife.js"></script>
<script>
    const animation = new WaveParticles();
</script>
```

## Configuration

You can pass a configuration object to the constructor to customize the visual engine.

```javascript
const animation = new WaveParticles({
    canvas: '#my-canvas', // Optional: selector or HTMLCanvasElement
    config: {
        waves: [
            {
                amplitude: 80,
                frequency: 0.002,
                speed: 0.004,
                yOffset: 0.5,
                color: 'rgba(200, 100, 100, 0.2)',
                layers: 3
            }
        ],
        particles: {
            countScale: 5000, // Pixels per particle (lower = denser)
            maxCount: 300     // Maximum limit
        },
        colors: {
            backgroundGradient: ['#ffffff', '#f0f0f0'],
            particleColorPrefixes: ['rgba(255, 0, 0,'] // Alpha is managed automatically
        }
    }
});
```

## Framework Integration

### React

```jsx
import {useEffect} from 'react';
import WaveParticles from 'js-waves-particles';

export const Background = () => {
    useEffect(() => {
        const animation = new WaveParticles();
        return () => animation.destroy();
    }, []);

    return null;
};
```

### Vue 3

```html

<script setup>
    import {onMounted, onUnmounted} from 'vue';
    import WaveParticles from 'js-waves-particles';

    let animation;
    onMounted(() => {
        animation = new WaveParticles();
    });
    onUnmounted(() => {
        animation.destroy();
    });
</script>
```

## API Reference

### `.start()`

Resumes the animation loop and re-attaches event listeners.

### `.stop()`

Pauses the animation loop and detaches listeners to save CPU cycles.

### `.resize()`

Forces the engine to recalculate dimensions and redistribute particles. Handled automatically with
debouncing on window resize.

### `.destroy()`

The nuclear option. Stops animation, removes listeners, and cleans up the DOM (if auto-created).

## License

[MIT](./LICENSE) © 2026 Luis 'PlatinumBlade' Moniz
