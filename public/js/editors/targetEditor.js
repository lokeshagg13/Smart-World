class TargetEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, MarkingEditor.types.ROADSPREAD);
    }

    createMarking(center, directionVector) {
        return new TargetMarking(
            center,
            directionVector,
            this.world.settings.roadWidth,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}