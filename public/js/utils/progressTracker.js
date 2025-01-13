class ProgressTracker {
    constructor() {
        this.counter = 0;
        this.maxCount = 100;
        this.percentage = 0;
        this.info = ''
        this.dots = ''
        this.dotsInterval = null;
    }

    #incrementCounter() {
        if (this.counter < this.maxCount) {
            this.counter += 1;
        }
    }

    #updateInfo() {
        document.querySelector('#progressBarModal .title').innerText = (this.info + ' ' + this.dots);
    }

    #updateCount() {
        $('#progressBarModal .progress-bar').prop("aria-valuenow", this.percentage === 0 ? "0" : this.percentage + "");
        $('#progressBarModal .progress-bar').css("width", this.percentage === 0 ? "0" : this.percentage + "%");
        $('#progressBarModal .progress-bar').css("width", this.percentage === 0 ? "0" : this.percentage + "%");

        document.querySelector('#progressBarModal .progress-bar').innerText = this.percentage + "%";
    }

    updateProgress() {
        this.#incrementCounter();
        const newPercentage = Math.floor(this.counter / this.maxCount * 100);
        if (newPercentage !== this.percentage) {
            this.percentage = newPercentage;
            this.#updateCount();
        }
        this.#updateInfo();
    }

    reset(maxCount, info = "") {
        this.counter = 0;
        this.maxCount = maxCount;
        this.percentage = 0;
        if (info !== "") {
            this.info = info;
        }
        if (this.dotsInterval) {
            clearInterval(this.dotsInterval);
        }
        this.dotsInterval = setInterval(() => {
            if (this.dots.length % 4 === 0) {
                this.dots = ''
            }
            this.dots += '.';
            this.#updateInfo();
        }, 1000);
        this.#updateCount();
        this.#updateInfo();
    }

    show() {
        document.getElementById('progressBarModal').style.display = "flex";
    }

    hide() {
        this.reset(100, '');
        document.getElementById('progressBarModal').style.display = "none";
    }
}