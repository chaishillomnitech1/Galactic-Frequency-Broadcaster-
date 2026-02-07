/**
 * Main Application Controller
 * Coordinates frequency generation, dashboard, and user interactions
 */

// Initialize components
const generator = new FrequencyGenerator();
const dashboard = new Dashboard();

// DOM elements
let frequencySelect, customFrequencyInput, customFrequencyGroup;
let volumeSlider, volumeValue, waveformSelect;
let startBtn, stopBtn;

// Application state
let currentFrequency = 963;

/**
 * Initialize the application
 */
function initializeApp() {
    // Get DOM elements
    frequencySelect = document.getElementById('frequency-select');
    customFrequencyInput = document.getElementById('custom-frequency');
    customFrequencyGroup = document.getElementById('custom-frequency-group');
    volumeSlider = document.getElementById('volume');
    volumeValue = document.getElementById('volume-value');
    waveformSelect = document.getElementById('waveform');
    startBtn = document.getElementById('start-btn');
    stopBtn = document.getElementById('stop-btn');

    // Initialize dashboard
    dashboard.initialize(generator);

    // Setup event listeners
    setupEventListeners();

    // Check Web Audio API support
    if (!FrequencyGenerator.isSupported()) {
        alert('Web Audio API is not supported in your browser. Please use a modern browser.');
        startBtn.disabled = true;
    }

    console.log('🌌 Galactic Frequency Broadcaster initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Frequency selection
    frequencySelect.addEventListener('change', handleFrequencyChange);
    customFrequencyInput.addEventListener('input', handleCustomFrequencyInput);

    // Volume control
    volumeSlider.addEventListener('input', handleVolumeChange);

    // Waveform selection
    waveformSelect.addEventListener('change', handleWaveformChange);

    // Start/Stop buttons
    startBtn.addEventListener('click', handleStart);
    stopBtn.addEventListener('click', handleStop);
}

/**
 * Handle frequency selection change
 */
function handleFrequencyChange(e) {
    const value = e.target.value;
    
    if (value === 'custom') {
        customFrequencyGroup.style.display = 'block';
        currentFrequency = parseInt(customFrequencyInput.value) || 440;
    } else {
        customFrequencyGroup.style.display = 'none';
        currentFrequency = parseInt(value);
    }

    // Update frequency in real-time if playing
    if (generator.isPlaying) {
        generator.setFrequency(currentFrequency);
        dashboard.updateFrequency(currentFrequency);
    }
}

/**
 * Handle custom frequency input
 */
function handleCustomFrequencyInput(e) {
    currentFrequency = parseInt(e.target.value) || 440;
    
    // Update frequency in real-time if playing
    if (generator.isPlaying) {
        generator.setFrequency(currentFrequency);
        dashboard.updateFrequency(currentFrequency);
    }
}

/**
 * Handle volume change
 */
function handleVolumeChange(e) {
    const volume = parseInt(e.target.value) / 100;
    volumeValue.textContent = `${e.target.value}%`;
    generator.setVolume(volume);
}

/**
 * Handle waveform change
 */
function handleWaveformChange(e) {
    const waveform = e.target.value;
    
    // Update waveform in real-time if playing
    if (generator.isPlaying) {
        generator.setWaveform(waveform);
    }
}

/**
 * Handle start broadcasting
 */
function handleStart() {
    try {
        const waveform = waveformSelect.value;
        
        // Start frequency generation
        const success = generator.start(currentFrequency, waveform);
        
        if (success) {
            // Update UI
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Start dashboard tracking
            dashboard.startSession();
            dashboard.updateFrequency(currentFrequency);
            dashboard.updateSyncStatus(true);
            
            // Simulate Galactic Federation sync
            simulateGalacticSync();
            
            console.log(`🎵 Broadcasting ${currentFrequency} Hz ${waveform} wave`);
        }
    } catch (error) {
        console.error('Failed to start broadcasting:', error);
        alert('Failed to start broadcasting. Please try again.');
    }
}

/**
 * Handle stop broadcasting
 */
function handleStop() {
    try {
        // Stop frequency generation
        generator.stop();
        
        // Update UI
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        // Stop dashboard tracking
        dashboard.stopSession();
        dashboard.updateFrequency(0);
        
        console.log('⏹ Broadcasting stopped');
    } catch (error) {
        console.error('Failed to stop broadcasting:', error);
    }
}

/**
 * Simulate Galactic Federation synchronization
 */
function simulateGalacticSync() {
    // Simulate connection process
    dashboard.updateSyncStatus(false);
    
    setTimeout(() => {
        dashboard.updateSyncStatus(true);
        console.log('🛸 Connected to Galactic Federation Omniverse Protocol');
    }, 1000);
}

/**
 * Handle VR/XR integration
 */
function checkXRSupport() {
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then(supported => {
            if (supported) {
                console.log('🥽 VR/XR support detected');
                // Additional VR initialization could go here
            }
        }).catch(error => {
            console.log('VR/XR check failed:', error);
        });
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        checkXRSupport();
    });
} else {
    initializeApp();
    checkXRSupport();
}

// Handle page visibility for audio context
document.addEventListener('visibilitychange', () => {
    if (document.hidden && generator.isPlaying) {
        // Keep audio playing when tab is hidden
        if (generator.audioContext && generator.audioContext.state === 'running') {
            console.log('Tab hidden - audio continues');
        }
    }
});
