/**
 * Dashboard Module
 * Handles resonance tracking, visualization, and multi-platform status
 */

class Dashboard {
    constructor() {
        this.startTime = null;
        this.sessionInterval = null;
        this.visualizationInterval = null;
        this.canvas = null;
        this.canvasContext = null;
        this.generator = null;
    }

    /**
     * Initialize dashboard
     * @param {FrequencyGenerator} generator - Frequency generator instance
     */
    initialize(generator) {
        this.generator = generator;
        this.setupCanvas();
        this.detectPlatform();
        this.initializeDimensions();
    }

    /**
     * Setup canvas for waveform visualization
     */
    setupCanvas() {
        this.canvas = document.getElementById('waveform-canvas');
        if (this.canvas) {
            this.canvasContext = this.canvas.getContext('2d');
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }
    }

    /**
     * Start session tracking
     */
    startSession() {
        this.startTime = Date.now();
        this.updateStatus('Active - Broadcasting', '#00d4ff');
        
        // Update session duration every second
        this.sessionInterval = setInterval(() => {
            this.updateSessionDuration();
        }, 1000);
        
        // Start visualization
        this.startVisualization();
    }

    /**
     * Stop session tracking
     */
    stopSession() {
        if (this.sessionInterval) {
            clearInterval(this.sessionInterval);
            this.sessionInterval = null;
        }
        
        this.stopVisualization();
        this.updateStatus('Inactive', '#888888');
        this.startTime = null;
        
        // Clear session duration
        const durationEl = document.getElementById('session-duration');
        if (durationEl) {
            durationEl.textContent = '00:00';
        }
    }

    /**
     * Update broadcasting status
     * @param {string} status - Status text
     * @param {string} color - Status color
     */
    updateStatus(status, color) {
        const statusEl = document.getElementById('broadcast-status');
        if (statusEl) {
            statusEl.textContent = status;
            statusEl.style.color = color;
        }
    }

    /**
     * Update current frequency display
     * @param {number} frequency - Current frequency in Hz
     */
    updateFrequency(frequency) {
        const freqEl = document.getElementById('current-freq');
        if (freqEl) {
            freqEl.textContent = `${frequency} Hz`;
        }
    }

    /**
     * Update session duration
     */
    updateSessionDuration() {
        if (!this.startTime) return;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const durationEl = document.getElementById('session-duration');
        if (durationEl) {
            durationEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    /**
     * Start waveform visualization
     */
    startVisualization() {
        if (!this.canvasContext || !this.generator) return;
        
        const draw = () => {
            if (!this.generator.isPlaying) return;
            
            const dataArray = this.generator.getAnalyserData();
            if (!dataArray) return;
            
            const bufferLength = dataArray.length;
            const { width, height } = this.canvas;
            
            // Clear canvas
            this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.canvasContext.fillRect(0, 0, width, height);
            
            // Draw waveform
            this.canvasContext.lineWidth = 2;
            this.canvasContext.strokeStyle = '#00d4ff';
            this.canvasContext.beginPath();
            
            const sliceWidth = width / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;
                
                if (i === 0) {
                    this.canvasContext.moveTo(x, y);
                } else {
                    this.canvasContext.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            this.canvasContext.lineTo(width, height / 2);
            this.canvasContext.stroke();
        };
        
        // Draw at 60fps
        this.visualizationInterval = setInterval(draw, 1000 / 60);
    }

    /**
     * Stop visualization
     */
    stopVisualization() {
        if (this.visualizationInterval) {
            clearInterval(this.visualizationInterval);
            this.visualizationInterval = null;
        }
        
        // Clear canvas
        if (this.canvasContext) {
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Detect and display platform information
     */
    detectPlatform() {
        const platformEl = document.getElementById('platform-info');
        if (!platformEl) return;
        
        let platform = 'Web';
        
        // Check for mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            platform = 'Mobile';
        }
        
        // Check for VR/XR support
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-vr').then(supported => {
                if (supported) {
                    platform += ' + VR';
                    platformEl.textContent = platform;
                }
            }).catch(() => {});
        }
        
        platformEl.textContent = platform;
    }

    /**
     * Initialize dimension broadcasting indicators
     */
    initializeDimensions() {
        const dimensionList = document.getElementById('dimension-list');
        if (!dimensionList) return;
        
        const dimensions = [
            'Dimension-1', 'Dimension-2', 'Dimension-3',
            'Dimension-4', 'Dimension-5', 'Dimension-∞'
        ];
        
        dimensions.forEach(dim => {
            const tag = document.createElement('span');
            tag.className = 'dimension-tag';
            tag.textContent = dim;
            dimensionList.appendChild(tag);
        });
    }

    /**
     * Update synchronization status
     * @param {boolean} connected - Connection status
     */
    updateSyncStatus(connected) {
        const syncEl = document.getElementById('sync-message');
        if (syncEl) {
            syncEl.textContent = connected 
                ? 'Connected to Omniverse Protocol' 
                : 'Synchronizing...';
            syncEl.style.color = connected ? '#00d4ff' : '#ffaa00';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
