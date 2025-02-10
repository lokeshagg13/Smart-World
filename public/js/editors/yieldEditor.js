class YieldEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, MarkingEditor.types.LANESPREAD);
    }

    createMarking(center, directionVector) {
        return new YieldMarking(
            center,
            directionVector,
            this.world.settings.roadWidth / 2,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}