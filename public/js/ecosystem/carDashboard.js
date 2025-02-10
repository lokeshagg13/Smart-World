class CarDashboard {
    constructor(world) {
        this.container = document.getElementById('carDashboardContainer');
        this.canvas = document.getElementById('carDashboardCanvas');
        this.world = world;
        this.visible = false;
        this.minimized = false;
        this.ctx = this.canvas.getContext("2d");

        this.container.style.width = this.canvas.width = document.getElementById('mainCanvas').width;
        this.container.style.height = this.canvas.height = 50;
    }

    load(world) {
        this.world = world;
        return this;
    }

    show() {
        this.visible = true;
        this.container.style.display = "block";
    }

    hide() {
        this.visible = false;
        this.container.style.display = "none";
    }

    minimize() {
        this.minimized = true;
        this.container.querySelector('#maximizeCarDashboardBtn').style.display = 'block';
        this.container.querySelector('#maximizedCarDashboard').style.display = 'none';
    }

    maximize() {
        this.minimized = false;
        this.container.querySelector('#maximizeCarDashboardBtn').style.display = 'none';
        this.container.querySelector('#maximizedCarDashboard').style.display = 'block';

    }

    draw() {
        if (this.visible && !this.minimized) {
            const { width, height } = this.canvas;
            this.ctx.clearRect(0, 0, width, height);

            if (!this.world.selectedCar || !this.world.selectedCar.target) {
                return;
            }

            const distanceToTarget = getDistanceForDisplay(this.world.selectedCar.distanceToTarget / 10);
            const avgSpeed = this.world.settings.carMaxSpeed * 60 / 10;   // 1 sec = 60 frames = s / 10 metres
            const etaForTarget = getETAForDisplay(this.world.selectedCar.distanceToTarget / (avgSpeed * 10));

            this.ctx.save();

            const padding = 10;
            const fontSize = 20;
            const textColor = "#FFFFFF"; // White for maximum contrast

            // Set font and calculate text dimensions
            this.ctx.font = `${fontSize}px Arial`;
            const text = `Distance: ${distanceToTarget}, ETA: ${etaForTarget}`;

            // Draw text
            this.ctx.fillStyle = textColor;
            this.ctx.textBaseline = "top";
            this.ctx.fillText(text, padding * 2, padding * 2);

            this.ctx.restore();
        }
    }
}
