class EngineSound {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.osc = this.audioContext.createOscillator();
        this.masterGain = this.audioContext.createGain();

        this.osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        this.osc.connect(this.masterGain);
        this.osc.start();

        this.masterGain.gain.value = 0.1; // Lower gain to prevent clipping
        this.masterGain.connect(this.audioContext.destination);

        this.lfo = this.audioContext.createOscillator();
        this.lfo.frequency.setValueAtTime(30, this.audioContext.currentTime);
        this.mod = this.audioContext.createGain();
        this.mod.gain.value = 20;
        this.lfo.connect(this.mod);
        this.mod.connect(this.osc.frequency);
        this.lfo.start();

        this.volume = this.masterGain.gain;
        this.frequency = this.osc.frequency;
    }

    setVolume(percent) {
        this.volume.value = percent;
    }

    setPitch(percent) {
        const frequency = Math.max(50, Math.min(percent * 200 + 100, 1000)); // Clamp frequency
        this.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    }

    stop() {
        this.osc.stop();
        this.lfo.stop();
        this.osc.disconnect();
        this.lfo.disconnect();
        this.masterGain.disconnect();
        this.audioContext.close();
    }
}
