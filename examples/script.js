// Initialize the animation
const animation = new WaveParticles();
let isPlaying = true;

// DOM Elements
const wavesContainer = document.getElementById('waves-container');
const particleCountInput = document.getElementById('particleCount');
const particleCountVal = document.getElementById('particleCount-val');
const particleColorsContainer = document.getElementById('particle-colors-container');
const backgroundColorsContainer = document.getElementById('background-colors-container');

// --- Helper Functions ---

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToHex(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    
    if (!match) {
        return rgba.startsWith('#') ? rgba : "#f8e1e7";
    }
    
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function hexToRgbaPrefix(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b},`;
}

// --- UI Syncing ---

function renderWaveControls() {
    wavesContainer.innerHTML = '<h3>Wave Layers</h3>';
    
    animation.config.waves.forEach((wave, index) => {
        const block = document.createElement('div');
        
        block.className = 'wave-control-block';

        const hexColor = rgbaToHex(wave.color);

        block.innerHTML = `
            <div class="wave-control-header">
                <strong>Wave #${index + 1}</strong>
                <button class="delete-btn" onclick="removeWave(${index})">Remove</button>
            </div>
            <div class="controls">
                <div class="control-group">
                    <div class="control-item">
                        <label>Amplitude: <span>${wave.amplitude}</span></label>
                        <input type="range" min="0" max="200" value="${wave.amplitude}" oninput="updateWave(${index}, 'amplitude', this.value)">
                    </div>
                    <div class="control-item">
                        <label>Frequency: <span>${wave.frequency}</span></label>
                        <input type="range" min="0.0001" max="0.02" step="0.0001" value="${wave.frequency}" oninput="updateWave(${index}, 'frequency', this.value)">
                    </div>
                </div>
                <div class="control-group">
                    <div class="control-item">
                        <label>Speed: <span>${wave.speed}</span></label>
                        <input type="range" min="0" max="0.05" step="0.001" value="${wave.speed}" oninput="updateWave(${index}, 'speed', this.value)">
                    </div>
                    <div class="control-item">
                        <label>Color</label>
                        <input type="color" value="${hexColor}" oninput="updateWave(${index}, 'color', this.value)">
                    </div>
                </div>
            </div>
        `;
        
        wavesContainer.appendChild(block);
    });
}

function renderParticleColors() {
    particleColorsContainer.innerHTML = '';
    animation.config.colors.particleColorPrefixes.forEach((prefix, index) => {
        // Extract hex from rgba prefix "rgba(r, g, b,"
        const match = prefix.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        let hex = "#ffffff";
        
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            hex = `#${r}${g}${b}`;
        } else if (prefix.startsWith('#')) {
            hex = prefix;
        }

        const wrapper = document.createElement('div');
        
        wrapper.className = 'color-input-wrapper';
        
        wrapper.innerHTML = `
            <input type="color" value="${hex}" oninput="updateParticleColor(${index}, this.value)">
            ${animation.config.colors.particleColorPrefixes.length > 1 ? `<button class="remove-color-btn" onclick="removeParticleColor(${index})">×</button>` : ''}
        `;
        
        particleColorsContainer.appendChild(wrapper);
    });
}

function renderBackgroundColors() {
    backgroundColorsContainer.innerHTML = '';
    
    animation.config.colors.backgroundGradient.forEach((color, index) => {
        const hex = color.startsWith('#') ? color : rgbaToHex(color);
        
        const wrapper = document.createElement('div');
        
        wrapper.className = 'color-input-wrapper';
        
        wrapper.innerHTML = `
            <input type="color" value="${hex}" oninput="updateBackgroundColor(${index}, this.value)">
            ${animation.config.colors.backgroundGradient.length > 1 ? `<button class="remove-color-btn" onclick="removeBackgroundColor(${index})">×</button>` : ''}
        `;
        
        backgroundColorsContainer.appendChild(wrapper);
    });
}

function syncUI() {
    particleCountInput.value = animation.config.particles.maxCount;
    
    particleCountVal.textContent = animation.config.particles.maxCount.toString();
    
    renderWaveControls();
    renderParticleColors();
    renderBackgroundColors();
}

// --- Interaction Handlers ---

window.updateWave = function(index, prop, value) {
    const wave = animation.config.waves[index];
    
    if (prop === 'color') {
        wave.color = hexToRgba(value, 0.25);
    } else {
        wav
        e[prop] = parseFloat(value);
    }
    
    // Update the label in the UI without full re-render
    const block = wavesContainer.children[index + 1]; // +1 for the <h3>
    const label = block.querySelector(`input[oninput*="'${prop}'"]`).previousElementSibling.querySelector('span');
    
    if (label) {
        label.textContent = value;
    }
};

window.addNewWave = function() {
    animation.config.waves.push({
        amplitude: Math.floor(Math.random() * 50 + 30),
        frequency: 0.003,
        speed: 0.006,
        yOffset: Math.random() * 0.4 + 0.3,
        color: 'rgba(201, 169, 110, 0.2)',
        lineWidth: 1.5,
        mouseInfluence: 0.45,
        layers: 2
    });
    
    renderWaveControls();
};

window.removeWave = function(index) {
    if (animation.config.waves.length > 1) {
        animation.config.waves.splice(index, 1);
        renderWaveControls();
    }
};

window.updateParticleColor = function(index, hex) {
    animation.config.colors.particleColorPrefixes[index] = hexToRgbaPrefix(hex);
    animation.initParticles();
};

window.addParticleColor = function() {
    animation.config.colors.particleColorPrefixes.push('rgba(255, 255, 255,');
    renderParticleColors();
    animation.initParticles();
};

window.removeParticleColor = function(index) {
    if (animation.config.colors.particleColorPrefixes.length > 1) {
        animation.config.colors.particleColorPrefixes.splice(index, 1);
        renderParticleColors();
        animation.initParticles();
    }
};

window.updateBackgroundColor = function(index, hex) {
    animation.config.colors.backgroundGradient[index] = hex;
};

window.addBackgroundColor = function() {
    animation.config.colors.backgroundGradient.push('#ffffff');
    renderBackgroundColors();
};

window.removeBackgroundColor = function(index) {
    if (animation.config.colors.backgroundGradient.length > 1) {
        animation.config.colors.backgroundGradient.splice(index, 1);
        renderBackgroundColors();
    }
};

particleCountInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    particleCountVal.textContent = val;
    animation.config.particles.maxCount = val;
    animation.initParticles();
});

window.toggleAnimation = function() {
    if (isPlaying) animation.stop();
    else animation.start();
    isPlaying = !isPlaying;
};

// Start
syncUI();
