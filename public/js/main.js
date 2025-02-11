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
let carDashboard = new CarDashboard(world);

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
let popoverTimeout;
let currentCarStyle = 'car_white';
let confirmBtnEventListener = null;
let submitBtnEventListener = null;
let isTrafficSideChangedConfirmed = false;
let tempSettings = JSON.parse(JSON.stringify(world.settings));



// Initial Function Calls

setMode("graph");

addEventListeners();

fillVariableHtmlData();

animate();




// #region - Regions helper shortcuts
// (Command + K then Command + zero) to hide all regions
// #endregion



// #region - HTML Helpers

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
                showPopoverByID('roadWidth');
                return;
            }
            tempSettings.roadWidth = value;
        });

    document
        .getElementById("roadWidthHint")
        .addEventListener('click',
            () => showPopoverByID('roadWidthHint')
        );

    document
        .getElementById("buildingWidth")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingWidth").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingWidth").value = tempSettings.buildingWidth;
                showPopoverByID('buildingWidth');
                return;
            }
            tempSettings.buildingWidth = value;
        });

    document
        .getElementById("buildingWidthHint")
        .addEventListener('click',
            () => showPopoverByID('buildingWidthHint')
        );

    document
        .getElementById("buildingMinLength")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("buildingMinLength").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("buildingMinLength").value = tempSettings.buildingMinLength;
                showPopoverByID('buildingMinLength');
                return;
            }
            tempSettings.buildingMinLength = value;
        });

    document
        .getElementById("buildingMinLengthHint")
        .addEventListener('click',
            () => showPopoverByID('buildingMinLengthHint')
        );

    document
        .getElementById("spacing")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("spacing").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("spacing").value = tempSettings.spacing;
                showPopoverByID('spacing');
                return;
            }
            tempSettings.spacing = value;
        });

    document
        .getElementById("spacingHint")
        .addEventListener('click',
            () => showPopoverByID('spacingHint')
        );

    document
        .getElementById("treeSize")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeSize").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeSize").value = tempSettings.treeSize;
                showPopoverByID('treeSize');
                return;
            }
            tempSettings.treeSize = value;
        });

    document
        .getElementById("treeSizeHint")
        .addEventListener('click',
            () => showPopoverByID('treeSizeHint')
        );

    document
        .getElementById("treeHeight")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("treeHeight").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("treeHeight").value = tempSettings.treeHeight;
                showPopoverByID('treeHeight');
                return;
            }
            tempSettings.treeHeight = value;
        });

    document
        .getElementById("treeHeightHint")
        .addEventListener('click',
            () => showPopoverByID('treeHeightHint')
        );

    document
        .getElementById("leftHandTrafficHint")
        .addEventListener('click',
            () => showPopoverByID('leftHandTrafficHint')
        );

    document
        .getElementById("rightHandTrafficHint")
        .addEventListener('click',
            () => showPopoverByID('rightHandTrafficHint')
        );

    document
        .getElementById("carMaxSpeedHint")
        .addEventListener('click',
            () => showPopoverByID('carMaxSpeedHint')
        );

    document
        .getElementById("carAccelerationHint")
        .addEventListener('click',
            () => showPopoverByID('carAccelerationHint')
        );

    document
        .getElementById("carControlTypeHint")
        .addEventListener('click',
            () => showPopoverByID('carControlTypeHint')
        );

    document
        .getElementById("simulationNumCars")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationNumCars").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-', '.'].includes(ev.data)) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showPopoverByID('simulationNumCars');
                return;
            }
            if (parseInt(value, 10) < 1) {
                document.getElementById("simulationNumCars").value = tempSettings.simulationNumCars;
                showPopoverByID('simulationNumCars');
                return;
            }
            tempSettings.simulationNumCars = value;
        });

    document
        .getElementById("simulationNumCarsHint")
        .addEventListener('click',
            () => showPopoverByID('simulationNumCarsHint')
        );

    document
        .getElementById("simulationDiffFactor")
        .addEventListener("input", (ev) => {
            const value = document.getElementById("simulationDiffFactor").value;
            if (value === "" && ev.data === null) {
                return;
            }
            if (['+', '-'].includes(ev.data)) {
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showPopoverByID('simulationDiffFactor');
                return;
            }
            if (parseFloat(value, 10) < 0 || parseFloat(value, 10) > 1) {
                document.getElementById("simulationDiffFactor").value = tempSettings.simulationDiffFactor;
                showPopoverByID('simulationDiffFactor');
                return;
            }
            tempSettings.simulationDiffFactor = value || 0.1;
        });

    document
        .getElementById("simulationDiffFactorHint")
        .addEventListener('click',
            () => showPopoverByID('simulationDiffFactorHint')
        );

    document
        .getElementById("showSensorsHint")
        .addEventListener('click',
            () => showPopoverByID('showSensorsHint')
        );

    window
        .addEventListener("click",
            (ev) => {
                if (
                    !ev.target.matches('#carStyle button.dropdown-btn') &&
                    !ev.target.matches('#carStyle button.dropdown-btn img.dropdown-selected') &&
                    !ev.target.matches('#carStyle span.dropdown-arrow') &&
                    !ev.target.matches('#carStyle span.dropdown-arrow img')
                ) {
                    document.getElementById("carStyleDropdown").style.display = "none";
                }
            }
        );
}

function fillVariableHtmlData() {
    // Info Popovers
    document
        .getElementById('roadWidthHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.roadWidthRange[0]}<br>
            <b>Maximum Value: </b>${Settings.roadWidthRange[1]}<br>
            <b>Purpose: </b>Controls the width of roads in the world.<br> 
            `
        );

    document
        .getElementById('buildingWidthHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.buildingWidthRange[0]}<br>
            <b>Maximum Value: </b>${Settings.buildingWidthRange[1]}<br>
            <b>Purpose: </b>Controls the width of buildings <i>(measured in the direction perpendicular to the roads)</i>.<br> 
            `
        );

    document
        .getElementById('buildingMinLengthHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.buildingMinLengthRange[0]}<br>
            <b>Maximum Value: </b>${Settings.buildingMinLengthRange[1]}<br>
            <b>Purpose: </b>Minimum Length for a building to be generated along the direction of the roads.<br> 
            `
        );

    document
        .getElementById('spacingHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.spacingRange[0]}<br>
            <b>Maximum Value: </b>${Settings.spacingRange[1]}<br>
            <b>Purpose: </b>Controls the spacing around the buildings and roads.<br> 
            `
        );

    document
        .getElementById('treeSizeHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.treeSizeRange[0]}<br>
            <b>Maximum Value: </b>${Settings.treeSizeRange[1]}<br>
            <b>Purpose: </b>Controls the area taken by each tree.<br> 
            `
        );

    document
        .getElementById('treeHeightHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.treeHeightRange[0]}<br>
            <b>Maximum Value: </b>${Settings.treeHeightRange[1]}<br>
            <b>Purpose: </b>Controls the height of trees.<br> 
            `
        );

    document
        .getElementById('leftHandTrafficHint')
        .setAttribute(
            'data-content',
            `
            In the <b>Left Hand Traffic System</b>, <br>
            <ul style="padding-left: 5px;">
                <li>Cars travel on left side on the road. </li>
                <li>Cars overtake from right hand side. </li>
                <li>Steering wheel is located on right side of vehicle. </li>
            </ul>
            `
        );

    document
        .getElementById('rightHandTrafficHint')
        .setAttribute(
            'data-content',
            `
            In the <b>Right Hand Traffic System</b>, <br>
            <ul style="padding-left: 5px;">
                <li>Cars travel on right side on the road. </li>
                <li>Cars overtake from left hand side. </li>
                <li>Steering wheel is located on left side of vehicle. </li>
            </ul>
            `
        );

    document
        .getElementById('carMaxSpeedHint')
        .setAttribute(
            'data-content',
            `
            <b>Purpose: </b>Controls the maximum speed that the cars in the world can reach.<br> 
            `
        );

    document
        .getElementById('carAccelerationHint')
        .setAttribute(
            'data-content',
            `
            <b>Purpose: </b>Controls the acceleration level of cars on single press of accelerator (forward key).<br> 
            `
        );

    document
        .getElementById('carControlTypeHint')
        .setAttribute(
            'data-content',
            `
            <b>Purpose: </b>Cars can be shifted to manual override mode by selecting <b>KEYS</b>.<br> 
            `
        );

    document
        .getElementById('simulationNumCarsHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.simulationNumCarsRange[0]}<br>
            <b>Maximum Value: </b>${Settings.simulationNumCarsRange[1]}<br>
            <b>Purpose: </b>Sets the number of cars to be used for simulation in the simulation mode.<br>
            <small><b>Disclaimer: Higher values might make the simulation slower.</b></small> 
            `
        );

    document
        .getElementById('simulationDiffFactorHint')
        .setAttribute(
            'data-content',
            `
            <b>Minimum Value: </b>${Settings.simulationDiffFactorRange[0]}<br>
            <b>Maximum Value: </b>${Settings.simulationDiffFactorRange[1]}<br>
            <b>Purpose: </b>Higher value of Simulation Differentiation Factor ensures higher
             variation in the learning behaviour of simulated cars.<br> 
            `
        );

    document
        .getElementById('showSensorsHint')
        .setAttribute(
            'data-content',
            `
            <b>Purpose: </b>Check it to view the sensor of the cars and how AI cars sense roads, markings 
            and targets.<br> 
            `
        );



    // Error Popovers
    document
        .getElementById('roadWidth')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.roadWidthRange[0]} and ${Settings.roadWidthRange[1]} (inclusive) required.`
        );

    document
        .getElementById('buildingWidth')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.buildingWidthRange[0]} and ${Settings.buildingWidthRange[1]} (inclusive) required.`
        );

    document
        .getElementById('buildingMinLength')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.buildingMinLengthRange[0]} and ${Settings.buildingMinLengthRange[1]} (inclusive) required.`
        );

    document
        .getElementById('spacing')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.spacingRange[0]} and ${Settings.spacingRange[1]} (inclusive) required.`
        );

    document
        .getElementById('treeSize')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.treeSizeRange[0]} and ${Settings.treeSizeRange[1]} (inclusive) required.`
        );

    document
        .getElementById('treeHeight')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.treeHeightRange[0]} and ${Settings.treeHeightRange[1]} (inclusive) required.`
        );

    document
        .getElementById('simulationNumCars')
        .setAttribute(
            'data-content',
            `Whole number between ${Settings.simulationNumCarsRange[0]} and ${Settings.simulationNumCarsRange[1]} (inclusive) required.`
        );

    document
        .getElementById('simulationDiffFactor')
        .setAttribute('data-content', `Keep the differentiation factor between ${Settings.simulationDiffFactorRange[0]} and ${Settings.simulationDiffFactorRange[1]} (inclusive) required.`
        );



    // Min Max Settings in Error Messages

    [...document.querySelectorAll('span.roadWidthMin')].map(el => el.innerText = Settings.roadWidthRange[0]);
    [...document.querySelectorAll('span.roadWidthMax')].map(el => el.innerText = Settings.roadWidthRange[1]);
    [...document.querySelectorAll('span.buildingWidthMin')].map(el => el.innerText = Settings.buildingWidthRange[0]);
    [...document.querySelectorAll('span.buildingWidthMax')].map(el => el.innerText = Settings.buildingWidthRange[1]);
    [...document.querySelectorAll('span.buildingMinLengthMin')].map(el => el.innerText = Settings.buildingMinLengthRange[0]);
    [...document.querySelectorAll('span.buildingMinLengthMax')].map(el => el.innerText = Settings.buildingMinLengthRange[1]);
    [...document.querySelectorAll('span.spacingMin')].map(el => el.innerText = Settings.spacingRange[0]);
    [...document.querySelectorAll('span.spacingMax')].map(el => el.innerText = Settings.spacingRange[1]);
    [...document.querySelectorAll('span.treeSizeMin')].map(el => el.innerText = Settings.treeSizeRange[0]);
    [...document.querySelectorAll('span.treeSizeMax')].map(el => el.innerText = Settings.treeSizeRange[1]);
    [...document.querySelectorAll('span.treeHeightMin')].map(el => el.innerText = Settings.treeHeightRange[0]);
    [...document.querySelectorAll('span.treeHeightMax')].map(el => el.innerText = Settings.treeHeightRange[1]);
    [...document.querySelectorAll('span.simulationNumCarsMin')].map(el => el.innerText = Settings.simulationNumCarsRange[0]);
    [...document.querySelectorAll('span.simulationNumCarsMax')].map(el => el.innerText = Settings.simulationNumCarsRange[1]);
    [...document.querySelectorAll('span.simulationDiffFactorMin')].map(el => el.innerText = Settings.simulationDiffFactorRange[0]);
    [...document.querySelectorAll('span.simulationDiffFactorMax')].map(el => el.innerText = Settings.simulationDiffFactorRange[1]);
}

// #endregion



// #region - Error Messages

const errorMessageSelectors = ['#settingsModal small.error-message', '#loadWorldModal small.error-message'];

function showErrorMessage(inputId, message = null) {
    if (message) {
        document.getElementById(inputId + 'Error').innerText = message;
    }
    document.getElementById(inputId + 'Error').style.display = 'block';
}

function hideErrorMessages() {
    const selectors = [...document.querySelectorAll(errorMessageSelectors.join(', '))];
    for (let i = 0; i < selectors.length; i++) {
        selectors[i].style.display = 'none';
    }
}

// #endregion



// #region - Popovers

const popoverSelectors = ['.btn-world-info', '#startBtn', '#targetBtn', '#manualOverrideBtn', 'input[data-content]', '#osmDataInput', '#saveSettingsBtn', '.hint'];

function hideAllPopovers() {
    $(popoverSelectors.join(', ')).popover('hide');
}

function showMustAddCarPopover(popoverContent) {
    clearTimeout(popoverTimeout);
    hideAllPopovers();
    document.getElementById('startBtn').setAttribute('data-toggle', 'popover');
    document.getElementById('startBtn').setAttribute('data-trigger', 'manual');
    document.getElementById('startBtn').setAttribute('title', 'Cars');
    document.getElementById('startBtn').setAttribute('data-content', popoverContent);
    $('#startBtn').popover('show');
    popoverTimeout = setTimeout(() => {
        hideAllPopovers();
        document.getElementById('startBtn').setAttribute('data-toggle', 'tooltip');
        document.getElementById('startBtn').setAttribute('data-trigger', 'hover');
        document.getElementById('startBtn').setAttribute('title', 'Car Editor Mode.');
    }, 4000);
}

function showMustAddTargetPopover() {
    clearTimeout(popoverTimeout);
    hideAllPopovers();
    document.getElementById('targetBtn').setAttribute('data-toggle', 'popover');
    document.getElementById('targetBtn').setAttribute('data-trigger', 'manual');
    document.getElementById('targetBtn').setAttribute('title', 'Target');
    $('#targetBtn').popover('show');
    popoverTimeout = setTimeout(() => {
        hideAllPopovers();
        document.getElementById('targetBtn').setAttribute('data-toggle', 'tooltip');
        document.getElementById('targetBtn').setAttribute('data-trigger', 'hover');
        document.getElementById('targetBtn').setAttribute('title', 'Target Editor Mode.');
    }, 4000);
}

function showManualOverridePopover() {
    clearTimeout(popoverTimeout);
    hideAllPopovers();
    document.getElementById('manualOverrideBtn').setAttribute('data-toggle', 'popover');
    document.getElementById('manualOverrideBtn').setAttribute('data-trigger', 'manual');
    $('#manualOverrideBtn').popover('show');
    popoverTimeout = setTimeout(() => {
        hideAllPopovers();
        document.getElementById('manualOverrideBtn').setAttribute('data-toggle', 'tooltip');
        document.getElementById('manualOverrideBtn').setAttribute('data-trigger', 'hover');
        document.getElementById('manualOverrideBtn').setAttribute('title', 'Manual Override');
    }, 4000);
}

function showPopoverByID(inputId, timeout = 3000) {
    clearTimeout(popoverTimeout);
    hideAllPopovers();
    $('#' + inputId).popover('show');
    popoverTimeout = setTimeout(() => hideAllPopovers(), timeout);
}

// #endregion



// #region - Showing and Hiding Modals

function showLoadingModal() {
    document.getElementById("loadingModal").style.display = "flex";
}

function hideLoadingModal() {
    document.getElementById("loadingModal").style.display = "none";
}

function showLoadWorldModal() {
    // Fetch the list of worlds from the server
    fetch("https://smart-world-ske3.onrender.com/api/get-worlds", {
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
                            onclick="showPopoverByID('world-info-${worldId}', 5000)"
                            data-toggle="popover"
                            data-placement="top"
                            data-trigger="click"
                            data-html="true"
                            data-content="<b>World ${worldId}</b><br />Created On: ${formatTimestamp(world.createdOn)}"    
                        ><img src="images/app_icons/info_icon.svg" alt="Info" /></button>
                        <button
                            class="btn-world-delete"
                            id="world-delete-${worldId}"
                            onclick="showConfirmingModal(
                                'Delete world', 
                                '<p>Are you sure you want to delete <b>World ${worldId}</b> from the list of saved worlds?</p>', 
                                'Delete',
                                () => deleteWorldUsingID('${world.id}')
                            )"
                        >🗑️</button>
                    </div>
                  </div>
                `;

                    // Add event listener to handle world selection
                    worldItem.querySelector('img').addEventListener("click", () => {
                        loadWorldUsingID(world.id);
                    });

                    worldItem.querySelector('h4').addEventListener("click", () => {
                        loadWorldUsingID(world.id);
                    });

                    // Append the world item to the container
                    worldListContainer.appendChild(worldItem);
                });
            } else {
                worldListContainer.innerHTML = "<p>No saved worlds found.</p>";
            }
            document.getElementById("worldFileInput").value = "";
            document.getElementById("worldDataInput").value = "";
            document.getElementById("loadWorldModal").style.display = "flex";
            document.body.classList.add('modal-open');
        })
        .catch((error) => {
            console.error("Error fetching worlds:", error);
            showErrorModal("Error fetching the saved worlds.");
        });
}

function hideLoadWorldModal() {
    hideAllPopovers();
    document.getElementById("loadWorldModal").style.display = "none";
    document.body.classList.remove('modal-open');
}

function showLoadOsmGraphModal() {
    document.getElementById('loadOsmGraphModal').style.display = "flex";
}

function hideLoadOsmGraphModal() {
    document.getElementById('loadOsmGraphModal').style.display = "none";
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
    hideAllPopovers();
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

function showPromptModal(title = "", body = "", submitBtnText = "", onSubmit = null) {
    document.querySelector('#promptModal .modal-title').innerText = title;
    document.querySelector('#promptModal .modal-body').innerHTML = body;
    document.querySelector('#promptModal .modal-footer .btn-primary').innerText = submitBtnText;
    if (submitBtnEventListener) {
        document.querySelector('#promptModal .modal-footer .btn-primary').removeEventListener('click', submitBtnEventListener);
    }
    submitBtnEventListener = onSubmit;
    document.querySelector('#promptModal .modal-footer .btn-primary').addEventListener('click', onSubmit);
    document.getElementById('promptModal').style.display = "flex";
}

function hidePromptModal() {
    hideAllPopovers();
    if (document.getElementById('adminPassword')) {
        document.getElementById('adminPassword').value = "";
    }
    document.getElementById('promptModal').style.display = "none";
}

// #endregion



// #region - Car Select Dropdowns

function toggleCarStyleDropdown() {
    const dropdown = document.getElementById("carStyleDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function selectCarStyleOption(carStyle = 'car_white', rowIndex = 0, colIndex = 0) {
    const carStyleBtn = document.querySelector("#carStyleBtn img");
    carStyleBtn.setAttribute('src', 'images/cars/' + carStyle + '.png');
    carStyleBtn.setAttribute('alt', carStyle.split('_').reverse().map(s => s[0].toUpperCase() + s.slice(1)).join(' '));
    document.getElementById("carStyleDropdown").style.display = "none";
    document.getElementById("carStyleDropdown").style.top = -58 * rowIndex - 10;
    document.getElementById("carStyleDropdown").style.left = -76 * colIndex;
    document.querySelector("img.dropdown-selected-icon").style.top = 56 * rowIndex + 5;
    document.querySelector("img.dropdown-selected-icon").style.left = 76 * colIndex + 8;
    currentCarStyle = carStyle;
}

// #endregion



// #region - Generating random cars in the world

function showGenerateCarsModal() {
    const maxCars = Math.min(
        Settings.generateNumCarsRange[1],
        Math.max(
            5,
            Math.round(world.graph.segments.length / 5) * 5
        )
    );

    const handleSubmit = (ev) => {
        ev.preventDefault();
        let generateNumCars = document.getElementById('generateNumCars').value;
        if (generateNumCars === "") {
            document.getElementById('generateNumCarsError').innerText = 'Please enter a value.';
            document.getElementById('generateNumCarsError').style.display = 'block';
            return;
        }
        if (/^\d+[.]?0?$/.test(generateNumCars) === false) {
            document.getElementById('generateNumCarsError').innerText = `Please enter an integer value between ${Settings.generateNumCarsRange[0]} and ${maxCars} (inclusive).`;
            document.getElementById('generateNumCarsError').style.display = 'block';
            return;
        }

        generateNumCars = parseInt(generateNumCars, 10);
        if (generateNumCars < Settings.generateNumCarsRange[0] || generateNumCars > maxCars) {
            document.getElementById('generateNumCarsError').innerText = `Please enter an integer value between ${Settings.generateNumCarsRange[0]} and ${maxCars} (inclusive).`;
            document.getElementById('generateNumCarsError').style.display = 'block';
            return;
        }
        world.generateCars(generateNumCars);
        hidePromptModal();
        setMode('select');
    };

    showPromptModal(
        'Generate Random Cars',
        `
            <form>
                <div class="form-group">
                    <label for="generateNumCars">
                        Number of Cars to add &nbsp;
                        <span
                            id="generateNumCarsHint"
                            class="hint"
                            data-toggle="popover"
                            data-placement="left"
                            data-trigger="manual"
                            data-html="true"
                            data-content="<b>Minimum Value: </b>${Settings.generateNumCarsRange[0]}<br><b>Maximum Value: </b>${maxCars}<br><b>Purpose: </b>Number of cars to generate in the world.<br>"
                        >
                            <img src="images/app_icons/info_icon.svg" alt="Info" />
                        </span>
                    </label>
                    <input
                        type="number"
                        id="generateNumCars"
                        class="form-control"
                        placeholder="Number of cars"
                        required
                    />
                    <small id="generateNumCarsError" class="error-message form-text">
                    </small>
                </div>
            </form>      
        `,
        'Generate',
        handleSubmit
    );

    document
        .getElementById("generateNumCarsHint")
        .addEventListener('click',
            () => showPopoverByID('generateNumCarsHint')
        );

}

// #endregion



// #region - World Animator

function displayEmptyGraph(viewpoint) {
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

function animate(time) {
    viewport.reset();
    const viewpoint = scale(viewport.getOffset(), -1);

    if (currentMode === "graph") {
        if (!world.graph || world.graph.points.length === 0) {
            displayEmptyGraph(viewpoint);
        }
    } else {
        visualizerCtx.lineDashOffset = -time / 60;
        if (currentMode === "world" && world.selectedCar) {
            viewport.setOffset(world.selectedCar.center);
        }
        if (currentMode === "simulation" && editors['simulation'].running) {
            if (world.followedCar) {
                viewport.setOffset(world.followedCar.center);
            }
            checkForSimulationSuccess();
        }
        changeManualOverrideButtonState();
        const renderRadius = viewport.getScreenRadius();
        world.draw(mainCtx, viewpoint, renderRadius, currentMode);
        miniMap.load(world).draw(viewpoint);

        if (currentMode !== "simulation" && world.selectedCar && world.selectedCar.target) {
            carDashboard.show();
            carDashboard.load(world).draw();
        } else {
            carDashboard.hide();
        }
    }

    editors[currentMode]?.display();

    requestAnimationFrame(animate);
}

// #endregion



// #region - Clear Canvas, Markings or Cars

function clearCanvas() {
    world = new World(new Graph());
    viewport = new Viewport(mainCanvas, world.zoom, world.offset);
    miniMap = new MiniMap(new MiniMapEditor(), world);
    carDashboard = new CarDashboard(world);
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

// #endregion



// #region - Mode Set and Helper Functions

function setMode(mode) {
    if (mode !== "graph" && mode !== "simulation" && mode !== "world" && mode === currentMode) {
        mode = "world"
    }
    if (mode === "target") {
        if (!world.markings.find(m => m instanceof StartMarking)) {
            showMustAddCarPopover("Add the car first before adding its target");
            return;
        }
        if (world.selectedCar === null) {
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
        carDashboard.hide();
        hideVisualizer();
    } else if (mode === "simulation") {
        document.querySelector('.simulator').style.display = "flex";
        document.querySelector('#settingsBtn').style.display = "inline-flex";
        document.querySelector('#exitSimulationModeBtn').style.display = "inline-flex";
        editors[mode].enable();
        miniMap.show();
        carDashboard.hide();
    } else {
        document.querySelector('.markings').style.display = "flex";
        document.querySelector('#editGraphBtn').style.display = "inline-flex";
        document.querySelector('#downloadWorldBtn').style.display = "inline-flex";
        document.querySelector('#clearCanvasBtn').style.display = "inline-flex";
        document.querySelector('#settingsBtn').style.display = "inline-flex";
        document.querySelector('#loadWorldBtn').style.display = "inline-flex";
        document.querySelector('#saveWorldBtn').style.display = "inline-flex";
        document.querySelector('#disposeCarsBtn').style.display = "inline-flex";
        document.querySelector('#disposeMarkingsBtn').style.display = "inline-flex";
        document.querySelector('#generateCarsBtn').style.display = "inline-flex";
        document.querySelector('#simulationBtn').style.display = "inline-flex";
        if (mode !== "world") {
            document
                .getElementById(mode + 'Btn')
                .classList
                .add('clicked');
        }
        else if (world.settings.carControlType === "KEYS") {
            showManualOverridePopover();
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
    if (mode === "simulation") {
        document.querySelector('.header .section').style.width = "7%";
    }
    else if (mode === "graph") {
        document.querySelector('.header .section').style.width = "12%";
    }
    else {
        document.querySelector('.header .section').style.width = "25%";
    }
}

// #endregion



// #region - Admin Section

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
    document.getElementById('visualizerIcon').setAttribute('src', 'images/app_icons/neural_hide_icon.svg');
    document.getElementById('visualizerIcon').setAttribute('alt', 'Hide Visualizer');
}

function hideVisualizer() {
    document.querySelector('.app').style.display = 'block';
    document.querySelector('.admin-only').style.display = 'none';
    document.getElementById('visualizerBtn').setAttribute('title', 'Show Visualizer');
    document.getElementById('visualizerIcon').setAttribute('src', 'images/app_icons/neural_icon.svg');
    document.getElementById('visualizerIcon').setAttribute('alt', 'Show Visualizer');
}

function showAdminSection() {
    showVisualizer();
}

function hideAdminSection() {
    hideVisualizer();
}

function showAdminLoginModal(prompt) {
    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const password = document.getElementById('adminPassword').value;
        if (!password) {
            document.getElementById('adminPasswordError').innerText = 'No password entered. Access denied!';
            document.getElementById('adminPasswordError').style.display = 'block';
            return;
        }

        try {
            const isValid = await adminLogin(password);
            if (isValid) {
                showAdminSection();
                hidePromptModal();
            } else {
                document.getElementById('adminPasswordError').innerText = 'Invalid password entered. Access denied!';
                document.getElementById('adminPasswordError').style.display = 'block';
            }
        } catch (error) {
            document.getElementById('adminPasswordError').innerText = 'Invalid password entered. Access denied!';
            document.getElementById('adminPasswordError').style.display = 'block';
        }
    };

    showPromptModal(
        'Admin Password',
        `
            <form>
                <div class="form-group">
                    <label for="adminPassword">${prompt}</label>
                    <input
                        type="password"
                        id="adminPassword"
                        class="form-control"
                        placeholder="Enter Admin Password"
                        required
                    />
                    <small id="adminPasswordError" class="error-message form-text">
                    </small>
                </div>
            </form>      
        `,
        'Submit',
        handleSubmit
    );
}

async function adminLogin(password) {
    try {
        const response = await fetch("https://smart-world-ske3.onrender.com/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password
            }),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('adminAccessToken', data.token);
            return true;
        }
        return false;

    } catch (error) {
        return false;
    }
}

async function toggleAdminSection() {
    if (isAdminSectionVisible()) {
        hideAdminSection();
        return;
    }

    const accessToken = localStorage.getItem('adminAccessToken');
    // Access Token exists, so verify it first and then perform login only if it is invalid/expired.
    if (accessToken) {
        try {
            const response = await fetch("https://smart-world-ske3.onrender.com/api/admin/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: accessToken,
                }),
            });

            if (!response.ok) {
                throw new Error("Admin access expired");
            }

            const data = await response.json();
            if (data.success) {
                showAdminSection();
            }

        } catch (error) {
            showAdminLoginModal('Your previous admin login must have been expired. Reenter the admin password.');
        }
        return;
    }

    // Access Token do not exist, so login must be performed
    showAdminLoginModal('Enter the admin password.');
}

// #endregion



// #region - Manual Overriding of Cars

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

// #endregion



// #region - World generation, saving, loading, downloading and deletion as well as Open Street Map Handler

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
    world.settings.carControlType = "AI";
    world.settings.showSensors = false;

    // Send the API request
    fetch("https://smart-world-ske3.onrender.com/api/save-world", {
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

function downloadWorldFile() {
    world.zoom = viewport.zoom;
    world.offset = scale(viewport.offset, -1);
    world.screenshot = mainCanvas.toDataURL("image/png");
    world.settings.carControlType = "AI";
    world.settings.showSensors = false;

    const worldString = JSON.stringify(world, null, 4);
    const blob = new Blob([worldString], { type: "application/json" });

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    link.download = `world_${formatCurrentTimeForFileName()}.json`;
    link.click();

    URL.revokeObjectURL(link.href); // Clean up by revoking the object URL
}

function loadWorldUsingID(worldId) {
    hideLoadWorldModal();
    fetch(`https://smart-world-ske3.onrender.com/api/load-world/${worldId}`, {
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

function loadWorldFromFile() {
    hideErrorMessages();

    const fileInput = document.getElementById('worldFileInput');

    if (!fileInput.files.length) {
        showErrorMessage('loadWorldFile', 'Please select a JSON file to load.');
        return;
    }

    const file = fileInput.files[0];

    if (file.type !== 'application/json') {
        showErrorMessage('loadWorldFile', 'Invalid file type. Please upload a .json file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            hideLoadWorldModal();
            const loadedWorld = JSON.parse(event.target.result);
            world = World.load(loadedWorld);
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
        } catch (error) {
            console.error("Error loading world:", error);
            showErrorModal("Error loading the world. Please check the file content.");
        }
    };

    reader.readAsText(file);
}

function loadWorldFromData() {
    hideErrorMessages();

    const dataInput = document.getElementById('worldDataInput').value;

    if (dataInput === "") {
        showErrorMessage('loadWorldData', 'Please input JSON data to load.');
        return;
    }

    try {
        hideLoadWorldModal();
        const loadedWorld = JSON.parse(dataInput);
        world = World.load(loadedWorld);
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
    } catch (error) {
        console.error("Error loading world:", error);
        showErrorModal("Error loading the world. Please check the JSON data.");
    }
}

function deleteWorldUsingID(worldId) {
    hideConfirmingModal();
    fetch(`https://smart-world-ske3.onrender.com/api/delete-world/${worldId}`, {
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
        showPopoverByID('osmDataInput');
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

// #endregion



// #region - Traffic Side (LHT/RHT) Change Helpers

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

// #endregion



// #region - Minimap Handlers

function minimizeMiniMap() {
    if (currentMode !== "graph") {
        miniMap.minimize();
    }
}

function maximizeMiniMap() {
    if (currentMode !== "graph") {
        miniMap.maximize();
    }
}

// #endregion



// #region - Car Dashboard Handlers

function minimizeCarDashboard() {
    if (currentMode !== "graph") {
        carDashboard.minimize();
    }
}

function maximizeCarDashboard() {
    if (currentMode !== "graph") {
        carDashboard.maximize();
    }
}

// #endregion



// #region - Simulation Related Functions

function resetCarBrain() {
    const tempBrain = new Brain();
    tempBrain.resetToDefault();
    tempBrain.save();
    Visualizer.brain = tempBrain;
    world.markings.forEach(m => {
        if (
            m instanceof StartMarking &&
            m.car &&
            m.car.brain
        ) {
            m.car.brain = tempBrain;
        }
    })
}

function checkForSimulationSuccess() {
    const successfulCarMarking = world.markings.find((m) =>
        (m instanceof StartMarking) &&
        (m.car.isSimulation === true) &&
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
    if (world.followedCar && world.followedCar.brain) {
        world.followedCar.brain.save();
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
    world.followedCar = null;
    editors["simulation"].running = false;
    editors["simulation"].targetMarking = null;
}

function exitSimulationMode() {
    resetSimulation();
    setMode('world');
}

// #endregion



// #region - Settings related functions

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

    if (
        !settings.roadWidth ||
        settings.roadWidth < Settings.roadWidthRange[0] ||
        settings.roadWidth > Settings.roadWidthRange[1]
    ) {
        showErrorMessage('roadWidth')
        valid = false;
    }

    if (
        !settings.buildingWidth ||
        settings.buildingWidth < Settings.buildingWidthRange[0] ||
        settings.buildingWidth > Settings.buildingWidthRange[1]
    ) {
        showErrorMessage('buildingWidth')
        valid = false;
    }

    if (
        !settings.buildingMinLength ||
        settings.buildingMinLength < Settings.buildingMinLengthRange[0] ||
        settings.buildingMinLength > Settings.buildingMinLengthRange[1]
    ) {
        showErrorMessage('buildingMinLength')
        valid = false;
    }

    if (
        !settings.spacing ||
        settings.spacing < Settings.spacingRange[0] ||
        settings.spacing > Settings.spacingRange[1]
    ) {
        showErrorMessage('spacing')
        valid = false;
    }

    if (!settings.treeSize ||
        settings.treeSize < Settings.treeSizeRange[0] ||
        settings.treeSize > Settings.treeSizeRange[1]
    ) {
        showErrorMessage('treeSize')
        valid = false;
    }

    if (!settings.treeHeight ||
        settings.treeHeight < Settings.treeHeightRange[0] ||
        settings.treeHeight > Settings.treeHeightRange[1]
    ) {
        showErrorMessage('treeHeight');
        valid = false;
    }

    if (!settings.simulationNumCars ||
        settings.simulationNumCars < Settings.simulationNumCarsRange[0] ||
        settings.simulationNumCars > Settings.simulationNumCarsRange[1]
    ) {
        showErrorMessage('simulationNumCars')
        valid = false;
    }

    if (!settings.simulationDiffFactor ||
        settings.simulationDiffFactor < Settings.simulationDiffFactorRange[0] ||
        settings.simulationDiffFactor > Settings.simulationDiffFactorRange[1]
    ) {
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
    showPopoverByID('saveSettingsBtn');
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
    hideAllPopovers();
}

// #endregion