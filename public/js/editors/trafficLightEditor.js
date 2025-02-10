class TrafficLightEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, MarkingEditor.types.LANESPREAD);
    }

    createMarking(center, directionVector) {
        return new TrafficLightMarking(
            center,
            directionVector,
            this.world.settings.roadWidth / 2,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}