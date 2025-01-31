class Settings {
    static roadWidthRange = [100, 200];
    static buildingWidthRange = [50, 200];
    static buildingMinLengthRange = [50, 150];
    static spacingRange = [0, 100];
    static treeSizeRange = [100, 200];
    static treeHeightRange = [100, 300];
    static simulationNumCarsRange = [1, 10000];
    static simulationDiffFactorRange = [0, 1];

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
        showSensors = false,
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
        this.showSensors = showSensors;
        this.carMaxSpeed = carMaxSpeed;
        this.carAcceleration = carAcceleration;
        this.carControlType = carControlType;
        this.roadFriction = roadFriction;
    }

    static load(settingsObj) {
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
            settingsObj.showSensors,
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
        this.showSensors = false;
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
        settingsObj.showSensors = this.showSensors;
        settingsObj.carMaxSpeed = "" + this.carMaxSpeed;
        settingsObj.carAcceleration = "" + this.carAcceleration;
        settingsObj.carControlType = "" + this.carControlType;
        settingsObj.roadFriction = this.roadFriction;
        return settingsObj;
    }
}