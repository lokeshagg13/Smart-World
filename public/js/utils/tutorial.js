class Tutorial {
    constructor() {
        this.steps = {
            graph: [
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            You are currently in the <b>Graph Mode</b> where you can design the skeleton of your world.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            The canvas here allows creating skeletons using <b>nodes</b> and <b>edges</b>.
                        </p>
                    `,
                    target: "#mainCanvas",
                },
                {
                    content: `
                    <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                        Click or tap anywhere to add nodes, and connect them with edges.
                    </p> `,
                    target: "#mainCanvas",
                },
                {
                    content: `
                    <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                        To remove a node and its corresponding segments, just <i>right-click (double-tap)</i> near that node.
                    </p> `,
                    target: "#mainCanvas",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            You can move nodes and change the shape of the skeleton by <b>dragging</b> them.
                        </p>
                    `,
                    target: "#mainCanvas",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            In case you do not want to create a world from scratch, use the <b>Load Skeleton</b> button 
                            to load complex worlds using <b>OSM data</b> from 
                            <a href="https://overpass-turbo.eu" target="_blank" style="color: #007bff; content-decoration: underline;">
                                Overpass Turbo
                            </a>.
                        </p>
                    `,
                    target: "#loadOsmGraphBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Once the skeleton is ready, click <b>Create World</b> to generate all world elements such as 
                            <i>roads, buildings, and trees</i> based on your design.
                        </p>
                    `,
                    target: "#generateWorldBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To clear and reset the canvas, use the <b>Clear Canvas</b> button.
                        </p>
                    `,
                    target: "#clearCanvasBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            You can also change settings related to the world, cars, or simulation 
                            using the <b>Settings</b> button.
                        </p>
                    `,
                    target: "#settingsBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            If you have already saved your world in this app or as a JSON file, 
                            you can <b>load your world</b> from here.
                        </p>
                    `,
                    target: "#loadWorldBtn",
                }
            ],
            world: [
                {
                    content: `
                        <h3 style="font-size: 1rem; margin-bottom: 10px;"><b>Welcome to World Mode</b></h3>
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            In this mode, you can <b>interact</b> with the world you created.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Now that the basic structure of your world is ready, you can add <b>markings</b> to it.
                        </p>
                    `,
                    target: '.markings',
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Use <b>Stop Markings</b> to make the car stop temporarily for 3 seconds.    
                        </p>
                    `,
                    target: "#stopBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Use <b>Crossings</b> to make the allow pedestrians to cross the roads and make the car stop until there is a crossing pedestrian.    
                        </p>
                    `,
                    target: "#crossingBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Use <b>Parking Signs</b> to locate car parking locations.    
                        </p>
                    `,
                    target: "#parkingBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Use <b>Yield Markings</b> to make the car slow down temporarily.    
                        </p>
                    `,
                    target: "#yieldBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Place <b>Traffic Lights</b> near road intersections to control traffic.    
                        </p>
                    `,
                    target: "#trafficLightBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            <b>Start Markings</b> can be used to place a new car at the desired starting position in your world.
                        </p>
                    `,
                    target: "#startBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To place a different style car, use the <b>Car Style </b> select option before placing a car.
                        </p>
                    `,
                    target: "#carStyle",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            <b>Target Markings</b> can be used to place target for the selected car.
                        </p>
                    `,
                    target: "#targetBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Use the <b>Car Select</b> button to <i>choose</i> or <i>switch</i> between cars.
                        </p>
                    `,
                    target: "#selectBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To change target for an existing car, first select that car using the <b>Car Select</b> button, then place its new target using <b>Target Marking</b> button.
                        </p>
                    `,
                    target: "#selectBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            AI-driven cars can be <b>manually overriden</b> using this <b>Manual Override</b> toggle button.
                        </p>
                    `,
                    target: "#manualOverrideBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            The <b>Visualizer</b> (admin only) displays the car AI's neural network 
                            and allows customization of AI behavior. You must have admin access to do so.
                        </p>
                    `,
                    target: "#visualizerBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Press <b>Save World</b> to save the current world.
                        </p>
                    `,
                    target: "#saveWorldBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To clear all cars in the world, use the <b>Remove Cars</b> button.
                        </p>
                    `,
                    target: "#disposeCarsBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To clear all markings (including cars) in the world, use the <b>Remove Markings</b> button.
                        </p>
                    `,
                    target: "#disposeMarkingsBtn"
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            For bigger worlds, placing random cars can be tedious if done manually. Instead, use the <b>Generate Cars</b> to randomly add cars to the world.
                        </p>
                    `,
                    target: "#generateCarsBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            At any point, to revert to the Graph Mode and modify the skeleton, press the <b>Edit Skeleton</b> button.
                        </p>
                    `,
                    target: "#editGraphBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            In addition to saving worlds, it is also possible to <b>download the JSON file</b> for your worlds.
                        </p>
                    `,
                    target: "#downloadWorldBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To retrain the cars, enter the <b>Simulation Mode</b> if required.
                        </p>
                    `,
                    target: "#simulationBtn",
                }
            ],
            simulation: [
                {
                    content: `
                        <h3 style="font-size: 1rem; margin-bottom: 10px;"><b>Welcome to Simulation Mode</b></h3>
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            In this mode, you can <b>perform simulations</b> in your world to retrain the AI cars.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Check out the simulation settings here to configure the <b>Number of Cars</b> and <b>Differentiation Factor</b> for simulation.
                        </p>
                    `,
                    target: "#settingsBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            The simulation will first ask you to <b>place a target</b> for your simulation cars.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            You can then place the <b>starting point</b> of your simulation cars.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            Cars will auto drive and <b>retrain themselves</b> to reach their target. When atleast one of the simulation car reach the target, <b>the simulation will auto save its result for you</b>.
                        </p>
                    `,
                    target: null,
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To explicitly save the simulation result for the world, press the <b>Save Simulation</b> button.
                        </p>
                    `,
                    target: "#saveSimulationBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To change the targets or resetting the whole simulation, click the <b>Reset Simulation</b> button.
                        </p>
                    `,
                    target: "#resetSimulationBtn",
                },
                {
                    content: `
                        <p style="font-size: 1rem; margin: 0; line-height: 1.5;">
                            To leave the simulation mode and return back to the World mode, use the <b>Exit Simulation</b> button.
                        </p>
                    `,
                    target: "#exitSimulationModeBtn",
                },
            ]
        };
        this.running = false;
        this.currentStep = 0;
        this.currentMode = null;

        this.contentElement = document.getElementById("tutorialContent");
        this.prevButton = document.getElementById("prevButton");
        this.nextButton = document.getElementById("nextButton");

        this.#initEventListeners();
    }

    #initEventListeners() {
        this.prevButton.addEventListener("click", this.#previousStep.bind(this));
        this.nextButton.addEventListener("click", this.#nextStep.bind(this));
        window.addEventListener("keydown", this.#handleKeyPress.bind(this));
    }

    #updateContent() {
        const step = this.steps[this.currentMode][this.currentStep];
        this.contentElement.innerHTML = step.content;

        // Unhighlight all the highlighted elements
        document.querySelectorAll(".highlighted").forEach(el => {
            el.classList.remove("highlighted");
        });

        // If target exist, highlight the target element
        if (step.target) {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                targetElement.classList.add("highlighted");
                targetElement.scrollIntoView();
            }
        }

        this.prevButton.style.display = this.currentStep === 0 ? "none" : "inline-block";
        this.nextButton.textContent = this.currentStep === this.steps[this.currentMode].length - 1 ? "Finish" : "Next";
    }

    #previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.#updateContent();
        }
    }

    #nextStep() {
        if (this.currentStep < this.steps[this.currentMode].length - 1) {
            this.currentStep++
            this.#updateContent();
        } else {
            this.skipTutorial();
        }
    }

    #handleKeyPress(ev) {
        if (!this.running || !ev.key) {
            return;
        }
        if (ev.key === "ArrowRight" || ev.key === "d") {
            ev.preventDefault();
            this.#nextStep();
        } else if (ev.key === "ArrowLeft" || ev.key === "a") {
            ev.preventDefault();
            this.#previousStep();
        } else if (ev.key === "Escape") {
            ev.preventDefault();
            this.skipTutorial();
        }
    }

    #hideTutorial() {
        this.running = false;
        document.getElementById('tutorialModal').style.display = "none";
    }

    #showTutorial() {
        this.running = true;
        document.getElementById('tutorialModal').style.display = "flex";
    }

    #changeTutorialTitle() {
        document.getElementById('tutorialTitle').textContent = this.currentMode[0].toUpperCase() + this.currentMode.slice(1) + " Mode Tutorial";
    }

    skipTutorial() {
        document.querySelectorAll(".highlighted").forEach(el => {
            el.classList.remove("highlighted");
        });
        this.#hideTutorial();
        localStorage.setItem(`${this.currentMode}TutorialSeen`, "true");
    }

    startTutorial(mode) {
        this.currentStep = 0;
        this.currentMode = (
            mode === "graph"
                ? "graph"
                : (
                    mode === "simulation"
                        ? "simulation"
                        : "world"
                )
        );
        this.#changeTutorialTitle();
        this.#showTutorial();
        this.#updateContent();
    }

    checkAndShowTutorial(mode) {
        mode = (
            mode === "graph"
                ? "graph"
                : (
                    mode === "simulation"
                        ? "simulation"
                        : "world"
                )
        );
        if (!localStorage.getItem(`${mode}TutorialSeen`)) {
            this.startTutorial(mode);
        }
    }

    resetLocalStorage() {
        ["graph", "world", "simulation"].forEach((mode) => {
            localStorage.removeItem(`${mode}TutorialSeen`);
        });
        localStorage.removeItem("appIntroHide");
    }
}
