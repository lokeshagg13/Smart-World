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
        const ctaMessage = document.querySelector(".cta-message");
        document
            .querySelector(".cta-create")
            .addEventListener("mouseover", () => {
                ctaMessage.innerHTML =
                    "Design custom worlds with nodes, edges, and imported skeletons.";
            });
        document
            .querySelector(".cta-simulate")
            .addEventListener("mouseover", () => {
                ctaMessage.innerHTML =
                    "Add cars, traffic markings, and other interactive elements.";
            });
        document.querySelector(".cta-train").addEventListener("mouseover", () => {
            ctaMessage.innerHTML =
                "Train AI models to drive cars and optimize traffic.";
        });

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