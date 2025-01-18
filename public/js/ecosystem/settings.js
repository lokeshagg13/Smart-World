class Settings {
    constructor(
        roadWidth = 100,
        roadRoundness = 10,
        buildingWidth = 150,
        buildingMinLength = 150,
        spacing = 50,
        treeSize = 160,
        treeHeight = 200,
        isLHT = true,
        simulationNumCars = 100,
        simulationDiffFactor = 0.1,
        sensorRayCount = 5,
        sensorRaySpread = Math.PI / 2,
        sensorRayLength = 100,
        showSensors = false,
        brainComplexity = "low",
        brainLevels = 3,
        brainNeuronCounts = [6, 4],
        carMaxSpeed = 3,
        carAcceleration = 0.2,
        carControlType = "AI",
        roadFriction = 0.05
    ) {
        this.roadWidth = roadWidth;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;
        this.treeHeight = treeHeight;
        this.isLHT = isLHT;
        this.simulationNumCars = simulationNumCars;
        this.simulationDiffFactor = simulationDiffFactor;
        this.sensorRayCount = sensorRayCount;
        this.sensorRaySpread = sensorRaySpread;
        this.sensorRayLength = sensorRayLength;
        this.showSensors = showSensors;
        this.brainComplexity = brainComplexity;
        this.brainLevels = brainLevels;
        this.brainNeuronCounts = [sensorRayCount, ...brainNeuronCounts];
        this.carMaxSpeed = carMaxSpeed;
        this.carAcceleration = carAcceleration;
        this.carControlType = carControlType;
        this.roadFriction = roadFriction;
    }

    static load(settingsObj) {
        settingsObj.brainLevels = 3
        settingsObj.brainNeuronCounts = [6, 4]
        switch (settingsObj.brainComplexity) {
            case "medium":
                settingsObj.brainLevels = 4
                settingsObj.brainNeuronCounts = [8, 6, 4]
                break;
            case "high":
                settingsObj.brainLevels = 5
                settingsObj.brainNeuronCounts = [6, 8, 6, 4]
                break;
            default:
                settingsObj.brainLevels = 3
                settingsObj.brainNeuronCounts = [6, 4]
                break;
        }

        return new Settings(
            tryParseInt(settingsObj.roadWidth, 100),
            tryParseInt(settingsObj.roadRoundness, 10),
            tryParseInt(settingsObj.buildingWidth, 150),
            tryParseInt(settingsObj.buildingMinLength, 150),
            tryParseInt(settingsObj.spacing, 50),
            tryParseInt(settingsObj.treeSize, 160),
            tryParseInt(settingsObj.treeHeight, 200),
            settingsObj.isLHT,
            tryParseInt(settingsObj.simulationNumCars, 100),
            tryParseFloat(settingsObj.simulationDiffFactor, 0.1),
            tryParseInt(settingsObj.sensorRayCount, 5),
            tryParseFloat(settingsObj.sensorRaySpread, Math.PI / 2),
            tryParseInt(settingsObj.sensorRayLength, 100),
            settingsObj.showSensors,
            settingsObj.brainComplexity,
            settingsObj.brainLevels,
            settingsObj.brainNeuronCounts,
            tryParseInt(settingsObj.carMaxSpeed, 3),
            tryParseFloat(settingsObj.carAcceleration, 0.2),
            settingsObj.carControlType,
            tryParseFloat(settingsObj.roadFriction, 0.05)
        );
    }

    save() {
        localStorage.setItem("settings", JSON.stringify(this));
    }

    reset() {
        this.roadWidth = 100;
        this.roadRoundness = 10;
        this.buildingWidth = 150;
        this.buildingMinLength = 150;
        this.spacing = 50;
        this.treeSize = 160;
        this.treeHeight = 200;
        this.isLHT = true;
        this.simulationNumCars = 100;
        this.simulationDiffFactor = 0.1;
        this.sensorRayCount = 5;
        this.sensorRaySpread = Math.PI / 2;
        this.sensorRayLength = 100;
        this.showSensors = false;
        this.brainComplexity = "low";
        this.brainLevels = 3;
        this.brainNeuronCounts = [5, 6, 4];
        this.carMaxSpeed = 3;
        this.carAcceleration = 0.2;
        this.carControlType = "AI";
        this.roadFriction = 0.05;
    }

    convertValuesToDisplay() {
        const settingsObj = {}
        settingsObj.roadWidth = this.roadWidth;
        settingsObj.roadRoundness = this.roadRoundness;
        settingsObj.buildingWidth = this.buildingWidth;
        settingsObj.buildingMinLength = this.buildingMinLength;
        settingsObj.spacing = this.spacing;
        settingsObj.treeSize = this.treeSize;
        settingsObj.treeHeight = this.treeHeight;
        settingsObj.isLHT = this.isLHT;
        settingsObj.simulationNumCars = "" + this.simulationNumCars;
        settingsObj.simulationDiffFactor = "" + this.simulationDiffFactor;
        settingsObj.sensorRayCount = "" + this.sensorRayCount;

        if (this.sensorRaySpread) {
            settingsObj.sensorRaySpread = "" + ((180 * this.sensorRaySpread) / Math.PI);
        } else {
            settingsObj.sensorRaySpread = "90";
        }

        settingsObj.sensorRayLength = "" + this.sensorRayLength;
        settingsObj.showSensors = this.showSensors;
        settingsObj.brainComplexity = this.brainComplexity;
        settingsObj.carMaxSpeed = "" + this.carMaxSpeed;
        settingsObj.carAcceleration = "" + this.carAcceleration;
        settingsObj.carControlType = "" + this.carControlType;
        settingsObj.roadFriction = this.roadFriction;
        return settingsObj;
    }
}