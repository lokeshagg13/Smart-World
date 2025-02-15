class AppIntro {
    constructor() {
        this.running = false;
        this.#initEventListeners();
    }

    #initEventListeners() {
        window.addEventListener("keydown", this.#handleKeyPress.bind(this));
    }

    #hideAppIntro() {
        this.running = false;
        document.getElementById('appIntroModal').style.display = "none";
    }

    #showAppIntro() {
        this.running = true;
        document.getElementById('appIntroModal').style.display = "flex";
        const introFrame = document.querySelector("#introFrame");
        introFrame.style.height = introFrame.contentWindow.document.body.scrollHeight + 'px';
        introFrame.style.width = introFrame.contentWindow.document.body.scrollWidth + 'px';
    }

    #handleKeyPress(ev) {
        if (!this.running || !ev.key) {
            return;
        }
        if (ev.key === "Enter" || ev.key === "Escape") {
            this.handleGetStartedButton();
        }
    }

    handleGetStartedButton() {
        const doNotShowAgain = document.getElementById('appIntroDontShow');
        if (doNotShowAgain.checked) {
            localStorage.setItem("appIntroHide", true);
        }
        this.#hideAppIntro();
        tutorial.checkAndShowTutorial("graph");
    }

    checkAndShowAppIntro() {
        if (!localStorage.getItem(`appIntroHide`)) {
            this.#showAppIntro();
        }
    }

    resetLocalStorage() {
        ["graph", "world", "simulation"].forEach((mode) => {
            localStorage.removeItem(`${mode}TutorialSeen`);
        });
        localStorage.removeItem("appIntroHide");
    }
}
