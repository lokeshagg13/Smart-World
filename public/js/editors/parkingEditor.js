class ParkingEditor extends MarkingEditor {
    constructor(viewport, world) {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center, directionVector) {
        return new ParkingMarking(
            center,
            directionVector,
            this.world.settings.roadWidth / 2,
            this.world.settings.roadWidth / 2,
            this.world.settings.isLHT
        );
    }
}