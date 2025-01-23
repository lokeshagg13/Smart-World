class Visualizer {

    static points = [];
    static segments = [];
    static mouse = new Point(0, 0);
    static highlightedPoint = null;
    static highlightedSegment = null;

    static nodeRadius = 12;
    static outputLabels = ['⬆', '⬇', '⬅', '⮕'];
    static inputLabels = ['↑', '⏱', '🚦', '🛑', '🚶', '⚠️', '🅿️', '↖', '↗'];

    static #handleMouseMove(ev) {
        const rad = 10;
        const rect = visualizerCtx.canvas.getBoundingClientRect();
        const scaleX = visualizerCtx.canvas.width / rect.width;
        const scaleY = visualizerCtx.canvas.height / rect.height;
        Visualizer.mouse = new Point(
            (ev.clientX - rect.left) * scaleX, // Adjusted X
            (ev.clientY - rect.top) * scaleY  // Adjusted Y
        );

        Visualizer.highlightedPoint = Graph.getNearestPoint(
            Visualizer.mouse,
            Visualizer.points,
            rad * 1.7
        );
        if (!Visualizer.highlightedPoint) {
            Visualizer.highlightedSegment = Graph.getNearestSegment(
                Visualizer.mouse,
                Visualizer.segments,
                rad
            );
        } else {
            Visualizer.highlightedSegment = null;
        }
    }

    static #drawLevel(
        levelIdx,
        level,
        left,
        top,
        width,
        height,
        outputLabels = [],
        inputLabels = []
    ) {
        const right = left + width;
        const bottom = top + height;

        const { inputs, outputs, weights, biases } = level;

        for (let i = 0; i < inputs.length; i++) {
            for (let o = 0; o < outputs.length; o++) {
                if (weights[i][o] === 0) {
                    continue;
                }
                const p1 = new Point(
                    Visualizer.#getNodeX(inputs, i, left, right),
                    bottom
                );
                const p2 = new Point(
                    Visualizer.#getNodeX(outputs, o, left, right),
                    top
                );
                const segment = new Segment(p1, p2);
                segment.info = { levelIdx, from: i, to: o };
                segment.value = weights[i][o];
                Visualizer.segments.push(segment);

                visualizerCtx.setLineDash([]);
                visualizerCtx.beginPath();
                visualizerCtx.moveTo(p1.x, p1.y);
                visualizerCtx.lineTo(p2.x, p2.y);
                visualizerCtx.lineWidth = 4;
                visualizerCtx.strokeStyle = "black";
                visualizerCtx.stroke();

                visualizerCtx.setLineDash([3, 3]);
                visualizerCtx.beginPath();
                visualizerCtx.moveTo(p1.x, p1.y);
                visualizerCtx.lineTo(p2.x, p2.y);
                visualizerCtx.lineWidth = 4;
                visualizerCtx.strokeStyle = getRGBA(weights[i][o]);
                visualizerCtx.stroke();
            }
        }

        if (levelIdx === 0) {
            for (let i = 0; i < inputs.length; i++) {
                const x = Visualizer.#getNodeX(inputs, i, left, right);

                const point = new Point(x, bottom);
                point.info = { levelIdx, at: i, inputNode: true };
                point.value = inputs[i];
                Visualizer.points.push(point);


                visualizerCtx.beginPath();
                visualizerCtx.arc(x, bottom, Visualizer.nodeRadius, 0, Math.PI * 2);
                visualizerCtx.fillStyle = "black";
                visualizerCtx.fill();

                if (inputLabels[i]) {
                    visualizerCtx.beginPath();
                    visualizerCtx.textAlign = "center";
                    visualizerCtx.textBaseline = "middle";
                    visualizerCtx.fillStyle = "white";
                    visualizerCtx.strokeStyle = "white";
                    visualizerCtx.font =
                        Visualizer.nodeRadius * (inputLabels[i] == "🛑" ? 0.7 : 0.8) + "px Arial";
                    visualizerCtx.fillText(
                        inputLabels[i],
                        x - (inputLabels[i] == "🛑" ? 0.02 : 0),
                        bottom + Visualizer.nodeRadius * (inputLabels[i] == "🛑" ? 0.06 : 0)
                    );
                    visualizerCtx.lineWidth = 0.5;
                    visualizerCtx.strokeText(
                        inputLabels[i],
                        x - (inputLabels[i] == "🛑" ? 0.02 : 0),
                        bottom + Visualizer.nodeRadius * (inputLabels[i] == "🛑" ? 0.06 : 0)
                    );
                }
            }
        }

        const outputColors = ["white", "blue", "red", "green"];
        for (let o = 0; o < outputs.length; o++) {
            const x = Visualizer.#getNodeX(outputs, o, left, right);

            const point = new Point(x, top);
            point.info = { levelIdx, at: o, inputNode: false };
            point.value = biases[o];
            Visualizer.points.push(point);

            visualizerCtx.beginPath();
            visualizerCtx.arc(x, top, Visualizer.nodeRadius, 0, Math.PI * 2);
            visualizerCtx.fillStyle = "black";
            visualizerCtx.fill();
            visualizerCtx.beginPath();
            visualizerCtx.arc(x, top, Visualizer.nodeRadius * 0.6, 0, Math.PI * 2);
            visualizerCtx.fillStyle = getRGBA(outputs[o]);
            visualizerCtx.fill();

            visualizerCtx.beginPath();
            visualizerCtx.lineWidth = 4;
            visualizerCtx.arc(x, top, Visualizer.nodeRadius * 0.8, 0, Math.PI * 2);
            visualizerCtx.strokeStyle = getRGBA(biases[o]);
            visualizerCtx.setLineDash([3, 3]);
            visualizerCtx.stroke();
            visualizerCtx.setLineDash([]);

            if (outputLabels[o]) {
                visualizerCtx.beginPath();
                visualizerCtx.textAlign = "center";
                visualizerCtx.textBaseline = "middle";
                visualizerCtx.fillStyle = outputColors[o];
                visualizerCtx.font = (Visualizer.nodeRadius) + "px Arial";
                visualizerCtx.fillText(outputLabels[o], x, top + Visualizer.nodeRadius * 0.1);
                visualizerCtx.lineWidth = 0.8;
            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(
            left,
            right,
            nodes.length == 1
                ? 0.5
                : index / (nodes.length - 1)
        );
    }

    static reset() {
        visualizerCtx.clearRect(0, 0, visualizerCtx.canvas.width, visualizerCtx.canvas.height);
        Visualizer.segments = [];
        Visualizer.points = [];
    }

    static addEventListeners() {
        visualizerCtx.canvas.addEventListener("mousemove", Visualizer.#handleMouseMove);
    }

    static drawNetwork(
        network,
        outputLabels = Visualizer.outputLabels,
        inputLabels = Visualizer.inputLabels
    ) {
        if (!network) {
            return
        }

        Visualizer.reset();
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = visualizerCtx.canvas.width - margin * 2;
        const height = visualizerCtx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

        // Draw highlighted point (if any)
        if (Visualizer.highlightedPoint) {
            const { x, y } = Visualizer.highlightedPoint
            visualizerCtx.beginPath();
            visualizerCtx.strokeStyle = "rgba(200,200,200,1)";
            visualizerCtx.lineWidth = 2;
            visualizerCtx.arc(x, y, Visualizer.nodeRadius * 1.1, 0, Math.PI * 2);
            visualizerCtx.stroke();
        }

        // Draw highlighted segment (if any)
        if (Visualizer.highlightedSegment) {
            const { p1, p2 } = Visualizer.highlightedSegment;
            visualizerCtx.beginPath();
            visualizerCtx.strokeStyle = "rgba(200,200,200,1)";
            visualizerCtx.fillStyle = "rgba(200,200,200,1)";
            visualizerCtx.lineWidth = 7;
            visualizerCtx.moveTo(p1.x, p1.y);
            visualizerCtx.lineTo(p2.x, p2.y);
            visualizerCtx.stroke();
        }

        // Draw the whole network
        for (let l = network.levels.length - 1; l >= 0; l--) {
            const levelTop = top + lerp(
                height - levelHeight,
                0,
                network.levels.length == 1
                    ? 0.5
                    : l / (network.levels.length - 1)
            );
            Visualizer.#drawLevel(
                l,
                network.levels[l],
                left,
                levelTop,
                width,
                levelHeight,
                l == network.levels.length - 1
                    ? outputLabels
                    : [],
                l == 0
                    ? inputLabels
                    : []
            );
        }

        // Draw biases/ weight/input value of highlighted point/segment
        if (Visualizer.highlightedPoint || Visualizer.highlightedSegment) {
            const rad = 8;
            const value = Visualizer.highlightedSegment
                ? network.levels[
                    Visualizer.highlightedSegment.info.levelIdx
                ].weights[
                Visualizer.highlightedSegment.info.from
                ][
                Visualizer.highlightedSegment.info.to
                ]
                : Visualizer.highlightedPoint.info.inputNode
                    ? network.levels[
                        Visualizer.highlightedPoint.info.levelIdx
                    ].inputs[
                    Visualizer.highlightedPoint.info.at
                    ]
                    : network.levels[
                        Visualizer.highlightedPoint.info.levelIdx
                    ].biases[
                    Visualizer.highlightedPoint.info.at
                    ];

            visualizerCtx.fillStyle = "white";
            visualizerCtx.textAlign = "center";
            visualizerCtx.textBaseline = "middle";
            visualizerCtx.font = "bold " + (rad * 1.5) + "px Arial";
            visualizerCtx.lineWidth = 1;
            visualizerCtx.beginPath();
            visualizerCtx.fillText(
                value == null ? "0.00" : value.toFixed(2),
                Visualizer.mouse.x + rad,
                Visualizer.mouse.y - rad
            );

        }
    }
}