class StartEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, MarkingEditor.types.LANESPREAD);
    }

    createMarking(center, directionVector) {
        const startMarking = new StartMarking(
            center,
            directionVector,
            this.world.settings.roadWidth * 0.4,
            this.world.settings.roadWidth / 4,
            this.world.settings.isLHT,
            false
        );
        startMarking.car.brain = new Brain();
        return startMarking;
    }
}