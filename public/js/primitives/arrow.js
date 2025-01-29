class Arrow {
    constructor(center, angle = 0, length = 50, headSize = 10) {
        this.center = center;
        this.angle = angle;
        this.length = length;
        this.headSize = headSize;
    }

    draw(ctx, { color = "black", width = 20 }) {
        // Calculate the start of the arrow (opposite direction from the angle)
        const startX = this.center.x - Math.cos(this.angle) * this.length;
        const startY = this.center.y - Math.sin(this.angle) * this.length;

        // Calculate points for the arrowhead
        const headAngle1 = this.angle + Math.PI / 6; // 30 degrees
        const headAngle2 = this.angle - Math.PI / 6; // -30 degrees

        const headPoint1 = {
            x: this.center.x - Math.cos(headAngle1) * this.headSize,
            y: this.center.y - Math.sin(headAngle1) * this.headSize,
        };

        const headPoint2 = {
            x: this.center.x - Math.cos(headAngle2) * this.headSize,
            y: this.center.y - Math.sin(headAngle2) * this.headSize,
        };

        // Draw the arrow
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(startX, startY); // Arrow body start
        ctx.lineTo(this.center.x, this.center.y); // Arrow body end
        ctx.stroke();

        // Draw the arrowhead
        ctx.beginPath();
        ctx.moveTo(this.center.x, this.center.y);
        ctx.lineTo(headPoint1.x, headPoint1.y);
        ctx.lineTo(headPoint2.x, headPoint2.y);
        ctx.closePath();
        ctx.fill();
    }
}