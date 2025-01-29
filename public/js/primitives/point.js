class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(point) {
        return this.x == point.x && this.y == point.y;
    }

    draw(ctx, { size = 18, color = "black", outline = false, outlineColor = "yellow", innerFill = false, innerFillColor = "yellow" } = {}) {
        const rad = size / 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (outline) {
            ctx.beginPath();
            ctx.lineWidth = 0.1 * size;
            ctx.strokeStyle = outlineColor;
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (innerFill) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = innerFillColor;
            ctx.fill();
        }
    }
}