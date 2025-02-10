class SoundControl {
    constructor() {
        this.engineSound = null;
    }

    startEngine() {
        this.stopEngine();
        this.engineSound = new EngineSound();
    }

    setEngineSound(sound) {
        if (this.engineSound) {
            this.engineSound.setVolume(sound);
            this.engineSound.setPitch(sound);
        }
    }

    stopEngine() {
        if (this.engineSound) {
            this.engineSound.stop();
            this.engineSound = null;
        }
    }

    playSuccessSound() {
        new SuccessSound().play();
    }
}