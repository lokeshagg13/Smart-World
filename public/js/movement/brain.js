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
            level => {
                for (let i = 0; i < level.biases.length; i++) {
                    level.biases[i] = lerp(
                        level.biases[i],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
                for (let i = 0; i < level.inputs.length; i++) {
                    for (let j = 0; j < level.outputs.length; j++) {
                        level.weights[i][j] = lerp(
                            level.weights[i][j],
                            Math.random() * 2 - 1,
                            amount
                        );
                    }
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

        Level.#randomize(this);
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