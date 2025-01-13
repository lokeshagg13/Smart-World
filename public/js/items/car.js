class Car {
    constructor(center, angle, isSimulation, controlType = "AI") {
        this.center = center;
        this.angle = angle;
        this.isSimulation = isSimulation;

        const settings = World.loadSettingsFromLocalStorage();
        this.maxSpeed = settings.carMaxSpeed;
        this.acceleration = settings.carAcceleration;
        this.friction = settings.roadFriction;

        this.damaged = false;
        this.speed = 0;
        this.fitness = 0;
        this.controls = {
            forward: false,
            left: false,
            right: false,
            reverse: false
        };

        this.target = null;
        this.path = null;

        if (controlType === "AI") {
            this.showSensor = settings.showSensors;
            this.sensor = new Sensor(
                this,
                settings.sensorRayCount,
                settings.sensorRayLength,
                settings.sensorRaySpread
            );
            this.brain = new NeuralNetwork(settings.brainNeuronCounts);
            // this.controls.forward = true;
        } else {
            this.#addKeyboardListeners();
        }

        this.img = new Image();
        this.img.src = "images/cars/car_white.png";
        this.width = this.img.width / 2;
        this.height = this.img.height / 2;
        this.polygon = this.#createPolygonAroundCar();
    }

    #addKeyboardListeners() {
        this.boundKeyDown = this.#handleKeyDown.bind(this);
        this.boundKeyUp = this.#handleKeyUp.bind(this);
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
    }

    #handleKeyDown(ev) {
        ev.preventDefault();
        switch (ev.key) {
            case "ArrowLeft":
                this.controls.left = true;
                break;
            case "ArrowRight":
                this.controls.right = true;
                break;
            case "ArrowUp":
                this.controls.forward = true;
                break;
            case "ArrowDown":
                this.controls.reverse = true;
                break;
        }
    }

    #handleKeyUp(ev) {
        ev.preventDefault();
        switch (ev.key) {
            case "ArrowLeft":
                this.controls.left = false;
                break;
            case "ArrowRight":
                this.controls.right = false;
                break;
            case "ArrowUp":
                this.controls.forward = false;
                break;
            case "ArrowDown":
                this.controls.reverse = false;
                break;
        }
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed != 0) {
            const flip = this.speed > 0 ? -1 : 1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        this.center = translate(this.center, this.angle - Math.PI / 2, this.speed);
    }

    #createPolygonAroundCar() {
        const points = [];
        const polygonWidth = this.height;
        const polygonHeight = this.width;
        const radius = Math.hypot(polygonWidth, polygonHeight) / 2;
        const alpha = Math.atan2(polygonWidth, polygonHeight);
        points.push(translate(this.center, this.angle + alpha, -radius));
        points.push(translate(this.center, this.angle - alpha, radius));
        points.push(translate(this.center, this.angle + alpha, radius));
        points.push(translate(this.center, this.angle - alpha, -radius));
        return new Polygon(points);
    }

    #assessDamage(roadBorders, roadDividers) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polygonSegmentIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }

        for (let i = 0; i < roadDividers.length; i++) {
            if (polygonSegmentIntersect(this.polygon, roadDividers[i])) {
                return true;
            }
        }
        return false;
    }

    #updateSettings(settings) {
        this.maxSpeed = settings.carMaxSpeed;
        this.acceleration = settings.carAcceleration;
        this.friction = settings.roadFriction;
        this.showSensor = settings.showSensors;
        this.sensor = new Sensor(
            this,
            settings.sensorRayCount,
            settings.sensorRayLength,
            settings.sensorRaySpread
        );
    }

    update(roadBorders, roadDividers) {
        const settings = World.loadSettingsFromLocalStorage();
        this.#updateSettings(settings);
        if (!this.damaged) {
            this.#move();
            if (this.controls.forward && !this.controls.reverse) {
                this.fitness += 1;
            }
            this.polygon = this.#createPolygonAroundCar();
            this.damaged = this.#assessDamage(roadBorders, roadDividers);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, roadDividers);

            // If there is no reading on a sensor which means no obstacle detected
            // then its input to the neural network is 0
            // Otherwise, it provides an inversed input to the network so
            // that nearer obstacles provide higher values to the network
            // than far object. Thus, in a way, inputs to the neural network
            // signifies the chances of collision with an obstacles.
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedforward(offsets, this.brain);

            if (this.brain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    draw(ctx) {
        if (!this.isSimulation && !this.damaged && this.showSensor && this.sensor) {
            this.sensor.draw(ctx);
        }

        // this.polygon.draw(ctx)

        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(this.angle)

        ctx.drawImage(this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();
    }
}