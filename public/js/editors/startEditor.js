class StartEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        const startMarking = new StartMarking(
            center,
            directionVector,
            this.world.settings.roadWidth * 0.4,
            this.world.settings.roadWidth / 4,
            this.world.settings.isLHT
        );
        const bestBrainString = localStorage.getItem("bestBrain");
        if (bestBrainString) {
            startMarking.car.brain = JSON.parse(bestBrainString);
        }
        return startMarking;
    }
}