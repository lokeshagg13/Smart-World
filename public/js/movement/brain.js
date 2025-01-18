class Brain {
    constructor() {
        this.network = new NeuralNetwork([9, 6, 4]);

        // First Level - Biases
        this.network.levels[0].biases[0] = -0.9;
        this.network.levels[0].biases[1] = -0.7;  // Speed cap (to make smoother turns, keep this value bigger and to make sharp turns, make this closer to -1)
        this.network.levels[0].biases[2] = -0.9;
        this.network.levels[0].biases[3] = 0.85;
        this.network.levels[0].biases[4] = 0;  // Left turn
        this.network.levels[0].biases[5] = 0;  // Right turn
        // First Level - Weights
        // For weights[x][y], x = 0 (frontReading), 
        //                        1 (speed), 
        //                        2 (trafficLightReading)
        //                        3 (stopSignReading), 
        //                        4 (crossingSignReading), 
        //                        5 (yeildSignReading), 
        //                        6 (parkingSignReading),
        //                        7 (leftReading), 
        //                        8 (rightReading)
        this.network.levels[0].weights[0][0] = -1;
        this.network.levels[0].weights[1][0] = -1;
        this.network.levels[0].weights[1][1] = -1;
        this.network.levels[0].weights[1][2] = -1;
        this.network.levels[0].weights[2][2] = -1;
        this.network.levels[0].weights[3][2] = -1;
        this.network.levels[0].weights[3][3] = 1;
        this.network.levels[0].weights[4][2] = -1;
        this.network.levels[0].weights[4][3] = 1;
        this.network.levels[0].weights[5][2] = -1;
        this.network.levels[0].weights[5][3] = 1;
        this.network.levels[0].weights[6][2] = -1;
        this.network.levels[0].weights[6][3] = 1;
        this.network.levels[0].weights[7][4] = -1; // Left sensor - Left turn
        this.network.levels[0].weights[7][5] = 1;  // Left sensor - Right turn
        this.network.levels[0].weights[8][4] = 1;  // Right sensor - Left turn
        this.network.levels[0].weights[8][5] = -1; // Right sensor - Right turn

        // Second Level - Biases
        this.network.levels[1].biases[0] = 0.6;
        this.network.levels[1].biases[1] = -0.6;
        // Second Level - Weights
        this.network.levels[1].weights[0][0] = 0.3;
        this.network.levels[1].weights[0][1] = -0.3;
        this.network.levels[1].weights[1][0] = 0.3;
        this.network.levels[1].weights[1][1] = -0.3;
        this.network.levels[1].weights[2][0] = 0.1;
        this.network.levels[1].weights[2][1] = -0.1;
        this.network.levels[1].weights[3][0] = 0.1;
        this.network.levels[1].weights[3][1] = -0.1;
        this.network.levels[1].weights[4][2] = 0.1;
        this.network.levels[1].weights[5][3] = 0.1;
    }

    static getControls({
        frontReading = 0,
        leftReading = 0,
        rightReading = 0,
        speed = 0,
        stopSignReading = 0,
        trafficLightReading = 0,
        crossingSignReading = 0,
        yeildSignReading = 0,
        parkingSignReading = 0
    } = {}, network) {
        const inputs = [frontReading, speed, trafficLightReading, stopSignReading, crossingSignReading, yeildSignReading, parkingSignReading, leftReading, rightReading];
        const outputs = NeuralNetwork.feedforward(inputs, network);
        const controls = {
            forward: outputs[0],
            reverse: outputs[1],
            left: outputs[2],
            right: outputs[3]
        }
        return controls;
    }
}

class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(
                new Level(
                    neuronCounts[i],
                    neuronCounts[i + 1]
                )
            );
        }
    }

    static feedforward(givenInputs, network) {
        let outputs = Level.feedforward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedforward(outputs, network.levels[i]);
        }
        return outputs;
    }

    static mutate(network, amount = 1) {
        network.levels.forEach(
            (level, index) => {
                if (index === 0) {
                    // For the level 0, biases at indices 4 and 5 control left and right turn respectively.
                    level.biases[4] = lerp(
                        level.biases[4],
                        Math.random() * 2 - 1,
                        amount
                    );
                    level.biases[5] = lerp(
                        level.biases[4],
                        Math.random() * 2 - 1,
                        amount
                    );

                    // For the level 0, weights at {7,4}, {7,5}, {8,4}, {8,5} control the left/right sensor and
                    // left/right turn relationship.
                    level.weights[7][4] = lerp(
                        level.weights[7][4],
                        Math.random() * 2 - 1,
                        amount
                    );
                    level.weights[7][5] = lerp(
                        level.weights[7][5],
                        Math.random() * 2 - 1,
                        amount
                    );
                    level.weights[8][4] = lerp(
                        level.weights[8][4],
                        Math.random() * 2 - 1,
                        amount
                    );
                    level.weights[8][5] = lerp(
                        level.weights[8][5],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        );
    }
}

class Level {
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#fill(this, 0);
        // Level.#randomize(this);
    }

    static #fill(level, value) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = value;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = value;
        }
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                // Gives a random value between -1 and 1
                // -ve weights decreases the importance of a direction and 
                // prevents car to turn in that direction but +ve weights 
                // makes it turn into a direction
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            // Gives a random value between -1 and 1
            // -ve weights decreases the importance of a direction and 
            // prevents car to turn in that direction but +ve weights 
            // makes it turn into a direction
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static feedforward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i]
        }

        for (let o = 0; o < level.outputs.length; o++) {
            let sum = 0;
            for (let i = 0; i < level.inputs.length; i++) {
                sum += level.weights[i][o] * level.inputs[i];
            }

            if (sum > level.biases[o]) {
                level.outputs[o] = 1;
            } else {
                level.outputs[o] = 0;
            }
        }
        return level.outputs;
    }
}