/**
 * Galactic Frequency Generator
 * Core Web Audio API implementation for real-time frequency generation
 */

class FrequencyGenerator {
    constructor() {
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.currentFrequency = 963;
        this.currentVolume = 0.3;
        this.currentWaveform = 'sine';
    }

    /**
     * Initialize the Web Audio API context
     */
    initialize() {
        if (!this.audioContext) {
            // Create audio context (compatible with different browsers)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.currentVolume;
            
            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            // Connect nodes: oscillator -> gain -> analyser -> destination
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
    }

    /**
     * Start broadcasting frequency
     * @param {number} frequency - Frequency in Hz
     * @param {string} waveform - Waveform type (sine, square, sawtooth, triangle)
     */
    start(frequency, waveform = 'sine') {
        this.initialize();
        
        // Resume audio context if suspended (browser security requirement)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Stop existing oscillator if playing
        if (this.oscillator) {
            this.stop();
        }
        
        // Create new oscillator
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = waveform;
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Connect oscillator to gain node
        this.oscillator.connect(this.gainNode);
        
        // Start oscillator
        this.oscillator.start();
        
        this.isPlaying = true;
        this.currentFrequency = frequency;
        this.currentWaveform = waveform;
        
        return true;
    }

    /**
     * Stop broadcasting
     */
    stop() {
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
            } catch (e) {
                console.warn('Oscillator already stopped');
            }
            this.oscillator = null;
        }
        this.isPlaying = false;
        return true;
    }

    /**
     * Set volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            this.currentVolume = volume;
        }
    }

    /**
     * Update frequency in real-time
     * @param {number} frequency - New frequency in Hz
     */
    setFrequency(frequency) {
        if (this.oscillator && this.isPlaying) {
            this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            this.currentFrequency = frequency;
        }
    }

    /**
     * Update waveform type
     * @param {string} waveform - Waveform type
     */
    setWaveform(waveform) {
        if (this.oscillator && this.isPlaying) {
            this.oscillator.type = waveform;
            this.currentWaveform = waveform;
        }
    }

    /**
     * Get analyser data for visualization
     * @returns {Uint8Array} Time domain data
     */
    getAnalyserData() {
        if (!this.analyser) return null;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);
        
        return dataArray;
    }

    /**
     * Get current state
     * @returns {Object} Current generator state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            frequency: this.currentFrequency,
            volume: this.currentVolume,
            waveform: this.currentWaveform
        };
    }

    /**
     * Check if Web Audio API is supported
     * @returns {boolean} Support status
     */
    static isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrequencyGenerator;
}
