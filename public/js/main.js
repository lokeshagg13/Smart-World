const mainCanvas = document.getElementById('mainCanvas');
mainCanvas.width = 600;
mainCanvas.height = 600;
const visualizerCanvas = document.getElementById('visualizerCanvas');
visualizerCanvas.width = 500;
visualizerCanvas.height = 600;

const mainCtx = mainCanvas.getContext("2d");
const visualizerCtx = visualizerCanvas.getContext("2d");

let world = new World(new Graph());
let viewport = new Viewport(mainCanvas, world.zoom, world.offset);
let miniMap = new MiniMap(new MiniMapEditor(), world);

Visualizer.reset();
Visualizer.addEventListeners();

let editors = {
    graph: new GraphEditor(viewport, world),
    simulation: new SimulationEditor(viewport, world),
    world: new WorldEditor(viewport, world),
    select: new SelectEditor(viewport, world),
    start: new StartEditor(viewport, world),
    stop: new StopEditor(viewport, world),
    yield: new YieldEditor(viewport, world),
    crossing: new CrossingEditor(viewport, world),
    parking: new ParkingEditor(viewport, world),
    target: new TargetEditor(viewport, world),
    trafficLight: new TrafficLightEditor(viewport, world),
};
const progressTracker = new ProgressTracker();

let currentMode;
let tooltipTimeout;
let confirmBtnEventListener = null;
let isTrafficSideChangedConfirmed = false;
let tempSettings = JSON.parse(JSON.stringify(world.settings));

setMode("graph");

addEventListeners();

animate();

function animate(time) {
    viewport.reset();
    const viewpoint = scale(viewport.getOffset(), -1);
    if (currentMode !== "graph") {
        visualizerCtx.lineDashOffset = -time / 60;
        if (currentMode === "world" && world.carToFollow) {
            viewport.setOffset(world.carToFollow.center);
        }
        if (currentMode === "simulation" && editors['simulation'].running) {
            checkForSimulationSuccess();
        }
        changeManualOverrideButtonState();
        const renderRadius = viewport.getScreenRadius();
        world.draw(mainCtx, viewpoint, renderRadius, currentMode);
        miniMap.load(world).draw(viewpoint);
    } else if (!world.graph || world.graph.points.length === 0) {
        viewpoint.draw(mainCtx, { size: mainCanvas.width / 2, color: "rgba(0,0,0,0.1)" });
        mainCtx.beginPath();
        mainCtx.textAlign = "center";
        mainCtx.textBaseline = "middle";
        mainCtx.fillStyle = "rgba(255, 255, 255, 0.1)";
        mainCtx.font = "100px Arial";
        mainCtx.fillText(
            "REF",
            viewpoint.x,
            viewpoint.y
        );
    }

    editors[currentMode]?.display();

    requestAnimationFrame(animate);
}

function hideAllPopovers() {
    $('.btn-world-info, #startBtn, #targetBtn').popover('hide');
}

function clearCanvas() {
    world = new World(new Graph());
    viewport = new Viewport(mainCanvas, world.zoom, world.offset);
    miniMap = new MiniMap(new MiniMapEditor(), world);
    editors = {
        graph: new GraphEditor(viewport, world),
        simulation: new SimulationEditor(viewport, world),
        world: new WorldEditor(viewport, world),
        select: new SelectEditor(viewport, world),
        start: new StartEditor(viewport, world),
        stop: new StopEditor(viewport, world),
        yield: new YieldEditor(viewport, world),
        crossing: new CrossingEditor(viewport, world),
        parking: new ParkingEditor(viewport, world),
        target: new TargetEditor(viewport, world),
        trafficLight: new TrafficLightEditor(viewport, world),
    };
    setMode('graph');
}

function disposeMarkings() {
    world.markings.length = 0;
    setMode('world');
}

function disposeCars() {
    // Remove all cars and their targets
    world.markings = world.markings.filter(
        (m) => !(
            (m instanceof StartMarking) ||
            (m instanceof TargetMarking)
        )
    );
    setMode('world');
}

function resetCarBrain() {
    const tempBrain = new Brain();
    tempBrain.resetToDefault();
    tempBrain.save();
    Visualizer.brain = tempBrain;
}

function setMode(mode) {
    if (mode !== "graph" && mode !== "simulation" && mode !== "world" && mode === currentMode) {
        mode = "world"
    }
    if (mode === "target") {
        if (!world.markings.find(m => m instanceof StartMarking)) {
            showMustAddCarPopover("Add the car first before adding its target");
            return;
        }
        if (world.carToFollow === null) {
            showMustAddCarPopover("Select the car first before adding/changing its target");
            return;
        }
    }
    hideToolboxes();
    hideButtons();
    disableEditors();
    resetMarkingButtons();
    resetHeaderControlWidth(mode);
    currentMode = mode;
    if (mode === "graph") {
        document.querySelector('#clearCanvasBtn').style.display = "inline-flex";
        document.querySelector('#settingsBtn').style.display = "inline-flex";
        document.querySelector('#loadWorldBtn').style.display = "inline-flex";
        document.querySelector('#loadOsmGraphBtn').style.display = "inline-flex";
        document.querySelector('#generateWorldBtn').style.display = "inline-flex";
        editors[mode].enable();
        miniMap.hide();
        hideVisualizer();
    } else if (mode === "simulation") {
        document.querySelector('.simulator').style.display = "flex";
        document.querySelector('#settingsBtn').style.display = "inline-flex";
        document.querySelector('#exitSimulationModeBtn').style.display = "inline-flex";
        document.querySelector('#visualizerBtn').style.display = "inline-flex";
        editors[mode].enable();
        miniMap.show();
    } else {
        document.querySelector('.markings').style.display = "flex";
        document.querySelector('#clearCanvasBtn').style.display = "inline-flex";
        document.querySelector('#settingsBtn').style.display = "inline-flex";
        document.querySelector('#manualOverrideBtn').style.display = "inline-flex";
        document.querySelector('#visualizerBtn').style.display = "inline-flex";
        document.querySelector('#loadWorldBtn').style.display = "inline-flex";
        document.querySelector('#saveWorldBtn').style.display = "inline-flex";
        document.querySelector('#disposeCarsBtn').style.display = "inline-flex";
        document.querySelector('#disposeMarkingsBtn').style.display = "inline-flex";
        document.querySelector('#editGraphBtn').style.display = "inline-flex";
        document.querySelector('#simulationBtn').style.display = "inline-flex";

        if (mode !== "world") {
            document
                .getElementById(mode + 'Btn')
                .classList
                .add('clicked');
        }
        editors[mode].enable();
        miniMap.show();
    }
}

function hideToolboxes() {
    document.querySelector('.markings').style.display = "none";
    document.querySelector('.simulator').style.display = "none";
}

function hideButtons() {
    [...document.querySelectorAll('.header button, .controls button')].map((btn) => btn.style.display = "none");
}

function disableEditors() {
    for (const editor of Object.values(editors)) {
        editor.disable();
    }
}

function resetMarkingButtons() {
    document.querySelectorAll('.markings button.clicked').forEach((btn) => {
        btn.classList.remove('clicked')
    });
}

function resetHeaderControlWidth(mode) {
    if (mode !== "graph" && mode !== "simulation") {
        document.querySelector('.header .section').style.width = "25%";
    } else {
        document.querySelector('.header .section').style.width = "15%";
    }
}

function isAdminSectionVisible() {
    const adminSection = document.querySelector('.admin-only');
    if (adminSection && adminSection.style.display === 'flex') {
        return true;
    }
    return false;
}

function showVisualizer() {
    document.querySelector('.app').style.display = 'flex';
    document.querySelector('.admin-only').style.display = 'flex';
    document.getElementById('visualizerBtn').setAttribute('title', 'Hide Visualizer');
    document.getElementById('visualizerIcon').setAttribute('src', 'images/neural_no.svg');
    document.getElementById('visualizerIcon').setAttribute('alt', 'Hide Visualizer');
}

function hideVisualizer() {
    document.querySelector('.app').style.display = 'block';
    document.querySelector('.admin-only').style.display = 'none';
    document.getElementById('visualizerBtn').setAttribute('title', 'Show Visualizer');
    document.getElementById('visualizerIcon').setAttribute('src', 'images/neural.svg');
    document.getElementById('visualizerIcon').setAttribute('alt', 'Show Visualizer');
}

function toggleVisualizer() {
    if (isAdminSectionVisible()) {
        hideVisualizer();
    } else {
        showVisualizer();
    }
}

function changeManualOverrideButtonState() {
    const currentType = world.settings.carControlType;
    if (currentType === "AI") {
        document.getElementById("manualOverrideBtn").style.backgroundColor = "white";
    } else {
        document.getElementById("manualOverrideBtn").style.backgroundColor = "rgb(0, 85, 255)";
    }
}

function toggleCarControlType() {
    const currentType = world.settings.carControlType;
    if (currentType === "AI") {
        world.settings.carControlType = "KEYS";
        document.getElementById("manualOverrideBtn").style.backgroundColor = "rgb(0, 85, 255)";
    } else {
        world.settings.carControlType = "AI";
        document.getElementById("manualOverrideBtn").style.backgroundColor = "white";
    }
    world.settings.save();
}

async function generateWorld() {
    if (world.graph.points.length === 0) {
        showErrorModal('A foundational skeleton structure is required for the world but is currently missing. Please create a skeleton using nodes and edges to proceed');
        return;
    }
    await world.generate();
    viewport.setMaxZoom();
    viewport.setOffset(world.graph.getCenter());
    setMode('world');
}

function saveWorldData() {
    world.zoom = viewport.zoom;
    world.offset = scale(viewport.offset, -1);
    world.screenshot = mainCanvas.toDataURL("image/png");

    // Send the API request
    fetch("http://localhost:3000/api/save-world", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            world,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to save world");
                });
            }
            return response.json();
        })
        .then(() => {
            showSaveConfirmationModal("World saved successfully.");
        })
        .catch((error) => {
            console.error("Error saving world:", error);
            showErrorModal("Error saving the world.");
        });
}

function loadWorldData(worldId) {
    hideLoadWorldModal();
    fetch(`http://localhost:3000/api/load-world/${worldId}`, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to fetch worlds");
                });
            }
            return response.json();
        })
        .then((data) => {
            const loadedWorld = data.world;
            world = World.load(loadedWorld); // Load the world data
            editors = {
                graph: new GraphEditor(viewport, world),
                simulation: new SimulationEditor(viewport, world),
                world: new WorldEditor(viewport, world),
                select: new SelectEditor(viewport, world),
                start: new StartEditor(viewport, world),
                stop: new StopEditor(viewport, world),
                yield: new YieldEditor(viewport, world),
                crossing: new CrossingEditor(viewport, world),
                parking: new ParkingEditor(viewport, world),
                target: new TargetEditor(viewport, world),
                trafficLight: new TrafficLightEditor(viewport, world),
            };
            showLoadingModal();
            setTimeout(() => {
                hideLoadingModal();
                setMode('world');
                viewport.setOffset(world.offset || world.graph.getCenter());
                viewport.setCustomZoom(world.zoom || viewport.zoomRange[1]);
            }, 3000);
        })
        .catch((error) => {
            console.error("Error loading world:", error);
            showErrorModal("Error loading the world.");
        });
}

function deleteWorldData(worldId) {
    hideConfirmingModal();
    fetch(`http://localhost:3000/api/delete-world/${worldId}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to delete world");
                });
            }
            return response.json();
        })
        .then((data) => {
            if (data.message && data.message === 'World deleted successfully') {
                hideLoadWorldModal();
                showLoadingModal();
                setTimeout(() => {
                    hideLoadingModal();
                    showLoadWorldModal();
                }, 3000);
            }
        })
        .catch((error) => {
            console.error("Error deleting the world:", error);
            showErrorModal("Error deleting the world.");
        });
}

function loadGraphFromOsm() {
    const osmDataContainer = document.getElementById('osmDataInput');
    if (osmDataContainer.value === "") {
        showTooltip('osmDataInput');
        return;
    }
    const osmParsedData = OSM.parseRoads(JSON.parse(osmDataContainer.value));
    if (osmParsedData.error) {
        showErrorModal(osmParsedData.message);
        return;
    }

    world.graph.points = osmParsedData.points;
    world.graph.segments = osmParsedData.segments;
    viewport.setOffset(world.graph.getCenter());
    hideLoadOsmGraphModal();
}

function showTrafficSideChangeConfirmationModal() {
    document.getElementById("trafficSideChangeModal").style.display =
        "flex";
}

function confirmTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
    isTrafficSideChangedConfirmed = true;
    world.markings.length = 0;
    saveSettings();
}

function cancelTrafficSideChange() {
    document.getElementById("trafficSideChangeModal").style.display =
        "none";
    isTrafficSideChangedConfirmed = false;
}

function showMustAddCarPopover(popoverContent) {
    hideAllPopovers();
    document.getElementById('startBtn').setAttribute('data-toggle', 'popover');
    document.getElementById('startBtn').setAttribute('data-trigger', 'manual');
    document.getElementById('startBtn').setAttribute('data-content', popoverContent);
    $('#startBtn').popover('show');
    setTimeout(() => {
        hideAllPopovers();
        document.getElementById('startBtn').setAttribute('data-toggle', 'tooltip');
        document.getElementById('startBtn').setAttribute('data-trigger', 'hover');
        document.getElementById('startBtn').setAttribute('title', 'Car Editor Mode.');
    }, 4000);
}

function showMustAddTargetPopover() {
    hideAllPopovers();
    document.getElementById('targetBtn').setAttribute('data-toggle', 'popover');
    document.getElementById('targetBtn').setAttribute('data-trigger', 'manual');
    $('#targetBtn').popover('show');
    setTimeout(() => {
        hideAllPopovers();
        document.getElementById('targetBtn').setAttribute('data-toggle', 'tooltip');
        document.getElementById('targetBtn').setAttribute('data-trigger', 'hover');
        document.getElementById('targetBtn').setAttribute('title', 'Target Editor Mode.');
    }, 4000);
}

function minimizeMiniMap() {
    if (currentMode !== "graph") {
        miniMap.minimize()
    }
}

function maximizeMiniMap() {
    if (currentMode !== "graph") {
        miniMap.maximize()
    }
}

function showSaveConfirmationModal(message) {
    document.getElementById("saveConfirmationModal").style.display = "flex";
    document.querySelector("#saveConfirmationModal .modal-body").innerHTML =
        "<p>" + message + "</p>";;
}

function hideSaveConfirmationModal() {
    document.getElementById("saveConfirmationModal").style.display = "none";
}

function showErrorModal(message) {
    document.querySelector("#errorModal .modal-body").innerHTML =
        "<p>" + message + "</p>";
    document.getElementById("errorModal").style.display = "flex";
}

function hideErrorModal() {
    document.getElementById("errorModal").style.display = "none";
}

function showConfirmingModal(title = "", body = "", confirmBtnText = "", onConfirm = null) {
    document.querySelector('#confirmingModal .modal-title').innerText = title;
    document.querySelector('#confirmingModal .modal-body').innerHTML = body;
    document.querySelector('#confirmingModal .modal-footer .btn-primary').innerText = confirmBtnText;
    if (confirmBtnEventListener) {
        document.querySelector('#confirmingModal .modal-footer .btn-primary').removeEventListener('click', confirmBtnEventListener);
    }
    confirmBtnEventListener = onConfirm;
    document.querySelector('#confirmingModal .modal-footer .btn-primary').addEventListener('click', onConfirm);
    document.getElementById('confirmingModal').style.display = "flex";
}

function hideConfirmingModal() {
    document.getElementById('confirmingModal').style.display = "none";
}

function showLoadingModal() {
    document.getElementById("loadingModal").style.display = "flex";
}

function hideLoadingModal() {
    document.getElementById("loadingModal").style.display = "none";
}

function showLoadWorldModal() {
    // Fetch the list of worlds from the server
    fetch("http://localhost:3000/api/get-worlds", {
        method: "POST",
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.details || "Failed to fetch worlds");
                });
            }
            return response.json();
        })
        .then((data) => {
            const worldListContainer = document.getElementById("worldList");
            worldListContainer.innerHTML = ""; // Clear existing content

            if (data.worlds && data.worlds.length > 0) {
                data.worlds.forEach((world, index) => {
                    // Create elements to display the world
                    const worldItem = document.createElement("div");
                    const worldId = index + 1;
                    worldItem.classList.add("world-item");
                    worldItem.setAttribute("id", world.id + "")
                    worldItem.innerHTML = `
                  <img src="${world.screenshot}" alt="World ${worldId}" />
                  <div class="world-info">
                    <h4>World ${worldId}</h4>
                    <div class="world-controls">
                        <button 
                            class="btn-world-info" 
                            id="world-info-${worldId}"
                            onclick="showWorldInfoPopover('world-info-${worldId}')"
                            data-toggle="popover"
                            data-placement="top"
                            data-trigger="click"
                            data-html="true"
                            data-content="<b>World ${worldId}</b><br />Created On: ${formatTimestamp(world.createdOn)}"    
                        >ℹ️</button>
                        <button
                            class="btn-world-delete"
                            id="world-delete-${worldId}"
                            onclick="showConfirmingModal(
                                'Delete world', 
                                '<p>Are you sure you want to delete <b>World ${worldId}</b> from the list of saved worlds?</p>', 
                                'Delete',
                                () => deleteWorldData('${world.id}')
                            )"
                        >🗑️</button>
                    </div>
                  </div>
                `;

                    // Add event listener to handle world selection
                    worldItem.querySelector('img').addEventListener("click", () => {
                        loadWorldData(world.id);
                    });

                    worldItem.querySelector('h4').addEventListener("click", () => {
                        loadWorldData(world.id);
                    });

                    // Append the world item to the container
                    worldListContainer.appendChild(worldItem);
                });
            } else {
                worldListContainer.innerHTML = "<p>No saved worlds found.</p>";
            }
            document.getElementById("loadWorldModal").style.display = "flex";
        })
        .catch((error) => {
            console.error("Error fetching worlds:", error);
            showErrorModal("Error fetching the saved worlds.");
        });
}

function hideLoadWorldModal() {
    hideAllPopovers();
    document.getElementById("loadWorldModal").style.display = "none";
}

function showLoadOsmGraphModal() {
    document.getElementById('loadOsmGraphModal').style.display = "flex";
}

function hideLoadOsmGraphModal() {
    document.getElementById('loadOsmGraphModal').style.display = "none";
}

function checkForSimulationSuccess() {
    const successfulCarMarking = world.markings.find((m) =>
        (m instanceof StartMarking) &&
        (m.car.success === true)
    );

    if (successfulCarMarking) {
        if (successfulCarMarking.car.brain) {
            successfulCarMarking.car.brain.save();
        }
        resetSimulation();
        showSaveConfirmationModal(`The current simulation is successful and the car has learned to 
            travel from the given start point towards the target of your world.`);
    }
}

function saveSimulationResult() {
    if (world.carToFollow && world.carToFollow.brain) {
        world.carToFollow.brain.save();
        showSaveConfirmationModal("Simulation saved successfully.");
        // Remove all simulation cars
        resetSimulation();
    }
}

function resetSimulation() {
    // Remove all simulation cars
    world.markings = world.markings.filter((m) => {
        if (!(m instanceof StartMarking)) {
            return true;
        }
        return !m.car.isSimulation;
    });
    editors["simulation"].running = false;
}

function exitSimulationMode() {
    resetSimulation();
    setMode('world');
}

function addEventListeners() {
    $('#trafficToggle').change((ev) => {
        tempSettings.isLHT = !ev.target.checked;
    });

    document
        .getElementById('clearCanvasBtn')
        .addEventListener('click', () => {
            showConfirmingModal(
                'Clear Canvas',
                `<p>
                Are you sure you want to clear the canvas area?
                <br />
                <br />
                <small>(Note: This action is unrecoverable.)</small>
                </p>`,
                'Clear',
                () => {
                    clearCanvas();
                    hideConfirmingModal();
                }
            );
        });

    document
        .getElementById('disposeCarsBtn')
        .addEventListener('click', () => {
            showConfirmingModal(
                'Remove Cars',
                `<p>
                Are you sure you want to remove all the cars from the world?
                <br />
                <br />
                <small>(Note: This action is unrecoverable.)</small>
                </p>`,
                'Continue',
                () => {
                    disposeCars();
                    hideConfirmingModal();
                }
            );
        });

    document
        .getElementById('disposeMarkingsBtn')
        .addEventListener('click', () => {
            showConfirmingModal(
                'Remove Markings',
                `<p>
                Are you sure you want to remove all the markings from the world?
                <br />
                <br />
                <small>(Note: This action is unrecoverable and will need you to create all markings <b>(including cars)</b> on the world.)</small>
                </p>`,
                'Continue',
                () => {
                    disposeMarkings();
                    hideConfirmingModal();
                }
            );
        });

    document
        .getElementById('editGraphBtn')
        .addEventListener('click', () => {
            showConfirmingModal(
                'Edit Skeleton',
                `<p>
                Are you sure you want to change to <b>Edit Skeleton</b> mode for this world?
                <br />
                <br />
                <small>(Note: This action is unrecoverable and will need you to regenerate & redecorate the world.</small>
                </p>`,
                'Continue',
                () => {
                    setMode('graph');
                    hideConfirmingModal();
                }
            );
        });

    document
        .getElementById("roadWidth")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("roadWidth").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("roadWidth").value = tempSettings.roadWidth;
                showTooltip('roadWidth');
                return;
            }
            tempSettings.roadWidth = value;
        });

    document
        .getElementById("buildingWidth")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingWidth").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingWidth").value = tempSettings.buildingWidth;
                showTooltip('buildingWidth');
                return;
            }
            tempSettings.buildingWidth = value;
        });

    document
        .getElementById("buildingMinLength")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingMinLength").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingMinLength").value = tempSettings.buildingMinLength;
                showTooltip('buildingMinLength');
                return;
            }
            tempSettings.buildingMinLength = value;
        });

    document
        .getElementById("spacing")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("spacing").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("spacing").value = tempSettings.spacing;
                showTooltip('spacing');
                return;
            }
            tempSettings.spacing = value;
        });

    document
        .getElementById("treeSize")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeSize").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeSize").value = tempSettings.treeSize;
                showTooltip('treeSize');
                return;
            }
            tempSettings.treeSize = value;
        });

    document
        .getElementById("treeHeight")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeHeight").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeHeight").value = tempSettings.treeHeight;
                showTooltip('treeHeight');
                return;
            }
            tempSettings.treeHeight = value;
        });

    document
        .getElementById("carMaxSpeed")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("carMaxSpeed").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("carMaxSpeed").value = tempSettings.carMaxSpeed;
                showTooltip('carMaxSpeed');
                return;
            }
            tempSettings.carMaxSpeed = value;
        });

    document
        .getElementById("carAcceleration")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("carAcceleration").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-'].includes(ev.data)) {
                document.getElementById("carAcceleration").value = tempSettings.carAcceleration;
                showTooltip('carAcceleration');
                return;
            }
            tempSettings.carAcceleration = value;
        });

    document
        .getElementById("simulationNumCars")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationNumCars").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showTooltip('simulationNumCars');
                return;
            }
            if (parseInt(value, 10) < 1) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showTooltip('simulationNumCars');
                return;
            }
            tempSettings.simulationNumCars = value;
        });

    document
        .getElementById("simulationDiffFactor")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationDiffFactor").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-'].includes(ev.data)) {
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showTooltip('simulationDiffFactor');
                return;
            }
            if (parseFloat(value, 10) < 0 || parseFloat(value, 10) > 1) {
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showTooltip('simulationDiffFactor');
                return;
            }
            tempSettings.simulationDiffFactor = value || 0.1;
        });
}

function showWorldInfoPopover(inputId) {
    hideAllPopovers();
    clearTimeout(tooltipTimeout);
    $('#' + inputId).popover('show');
    tooltipTimeout = setTimeout(() => hideAllPopovers(), 5000);
}

function showTooltip(inputId) {
    clearTimeout(tooltipTimeout);
    $('#' + inputId).popover('show');
    tooltipTimeout = setTimeout((id) => hideTooltip(id), 3000, inputId);
}

function hideTooltip(inputId) {
    $('#' + inputId).popover('hide')
}

function showErrorMessage(inputId) {
    document.getElementById(inputId + 'Error').style.display = 'block';
}

function hideErrorMessages() {
    const selectors = [...document.querySelectorAll('#settingsModal small.error-message')];
    for (let i = 0; i < selectors.length; i++) {
        selectors[i].style.display = 'none';
    }
}

function loadSettingsIntoDisplay() {
    // Reset World Section
    document.getElementById("roadWidth").value = world.settings.roadWidth;
    document.getElementById("buildingWidth").value = world.settings.buildingWidth;
    document.getElementById("buildingMinLength").value = world.settings.buildingMinLength;
    document.getElementById("spacing").value = world.settings.spacing;
    document.getElementById("treeSize").value = world.settings.treeSize;
    document.getElementById("treeHeight").value = world.settings.treeHeight;
    $("#trafficToggle").bootstrapToggle(world.settings.isLHT ? 'off' : 'on');

    // Reset Cars Section
    document.getElementById("carMaxSpeed").value = world.settings.carMaxSpeed; // Medium
    document.getElementById("carAcceleration").value = world.settings.carAcceleration; // Medium
    document.getElementById("carControlType").value = world.settings.carControlType; // AI / KEYS

    // Reset Simulation Section
    document.getElementById("simulationNumCars").value = world.settings.simulationNumCars;
    document.getElementById("simulationDiffFactor").value = world.settings.simulationDiffFactor;

    // Reset Sensors Section
    document.getElementById("showSensors").checked = world.settings.showSensors;
}

function areValidSettings(settings) {
    let valid = true;
    if (!settings.roadWidth || (settings.roadWidth < 100 || settings.roadWidth > 500)) {
        showErrorMessage('roadWidth')
        valid = false;
    }
    if (!settings.buildingWidth || (settings.buildingWidth < 50 || settings.buildingWidth > 200)) {
        showErrorMessage('buildingWidth')
        valid = false;
    }
    if (!settings.buildingMinLength || (settings.buildingMinLength < 50 || settings.buildingMinLength > 150)) {
        showErrorMessage('buildingMinLength')
        valid = false;
    }
    if (!settings.spacing || (settings.spacing < 0 || settings.spacing > 100)) {
        showErrorMessage('spacing')
        valid = false;
    }
    if (!settings.treeSize || (settings.treeSize < 100 || settings.treeSize > 200)) {
        showErrorMessage('treeSize')
        valid = false;
    }
    if (!settings.treeHeight || (settings.treeHeight < 100 || settings.treeHeight > 300)) {
        showErrorMessage('treeHeight')
        valid = false;
    }
    if (!settings.simulationNumCars || settings.simulationNumCars < 1) {
        showErrorMessage('simulationNumCars')
        valid = false;
    }
    if (!settings.simulationDiffFactor || (settings.simulationDiffFactor < 0 || settings.simulationDiffFactor > 1)) {
        showErrorMessage('simulationDiffFactor')
        valid = false;
    }
    return valid;
}

function saveSettings() {
    hideErrorMessages();

    if (!isTrafficSideChangedConfirmed) {
        if (tempSettings.isLHT !== world.settings.isLHT) {
            showTrafficSideChangeConfirmationModal();
            return;
        }
    } else {
        isTrafficSideChangedConfirmed = false;
    }

    const worldSettingsObj = world.settings.convertValuesToDisplay();

    // Save World Section
    worldSettingsObj.roadWidth = document.getElementById("roadWidth").value;
    worldSettingsObj.buildingWidth = document.getElementById("buildingWidth").value;
    worldSettingsObj.buildingMinLength = document.getElementById("buildingMinLength").value;
    worldSettingsObj.spacing = document.getElementById("spacing").value;
    worldSettingsObj.treeSize = document.getElementById("treeSize").value;
    worldSettingsObj.treeHeight = document.getElementById("treeHeight").value;
    worldSettingsObj.isLHT = !document.getElementById("trafficToggle").checked;

    // Save Cars Section
    worldSettingsObj.carMaxSpeed = document.getElementById("carMaxSpeed").value; // Medium
    worldSettingsObj.carAcceleration = document.getElementById("carAcceleration").value; // Medium
    worldSettingsObj.carControlType = document.getElementById("carControlType").value; // Medium

    // Save Simulation Section
    worldSettingsObj.simulationNumCars = document.getElementById("simulationNumCars").value;
    worldSettingsObj.simulationDiffFactor = document.getElementById("simulationDiffFactor").value;

    // Save Sensors Section
    worldSettingsObj.showSensors = document.getElementById("showSensors").checked;

    const newSettings = Settings.load(worldSettingsObj);
    if (areValidSettings(newSettings)) {
        world.settings = newSettings;
        world.settings.save();
        showSaveConfirmationModal('Settings saved successfully');
        loadSettingsIntoDisplay();
    }
}

function resetSettings() {
    hideErrorMessages();
    showTooltip('saveSettingsBtn');
    setTimeout(() => hideTooltip('saveSettingsBtn'), 3000)
    world.settings.reset();
    world.settings.save();
    loadSettingsIntoDisplay();
}

function showSettingsModal() {
    loadSettingsIntoDisplay();
    if (currentMode === "graph") {
        document.getElementById('worldSettingsDisclaimer').style.display = 'none';
        const worldSettingsInputs = document.querySelectorAll('#worldSettingsForm input');
        worldSettingsInputs.forEach((i) => i.removeAttribute('disabled'));
        $('#trafficToggle').bootstrapToggle('enable');
    } else {
        document.getElementById('worldSettingsDisclaimer').style.display = 'block';
        const worldSettingsInputs = document.querySelectorAll('#worldSettingsForm input');
        worldSettingsInputs.forEach((i) => i.setAttribute('disabled', true));
        $('#trafficToggle').bootstrapToggle('disable');
    }
    document.getElementById("settingsModal").style.display = "block";
    hideErrorMessages();
}

function hideSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
    hideErrorMessages();
}