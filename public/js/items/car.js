class Car {
    constructor(center, angle, isSimulation = false) {
        this.center = center;
        this.angle = angle;
        this.isSimulation = isSimulation;

        const settings = World.loadSettingsFromLocalStorage();
        this.maxSpeed = settings.carMaxSpeed;
        this.acceleration = settings.carAcceleration;
        this.friction = settings.roadFriction;
        this.controlType = settings.carControlType;

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
        this.path = [];
        this.pathBorders = [];
        this.success = false;    // becomes true when car reaches the target of the world

        this.showSensor = settings.showSensors;
        this.sensor = new Sensor();

        this.brain = new Brain();
        this.#addKeyboardListeners();

        this.img = new Image();
        this.img.src = `images/cars/${currentCarStyle || 'car_white'}.png`;
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
        const settings = World.loadSettingsFromLocalStorage();
        this.#updateSettings(settings);
        if (this.controlType === "AI") {
            return;
        }
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

    #assessDamage() {
        for (let i = 0; i < this.pathBorders.length; i++) {
            if (polygonSegmentIntersect(this.polygon, this.pathBorders[i])) {
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
        if (this.isSimulation) {
            this.controlType = "AI";
        } else {
            if (this.controlType === "AI" && settings.carControlType === "KEYS") {
                this.controls = {
                    forward: false,
                    left: false,
                    right: false,
                    reverse: false
                };
            }
            this.controlType = settings.carControlType;
        }
    }

    update(roadBorders, markings) {
        const settings = World.loadSettingsFromLocalStorage();
        this.#updateSettings(settings);

        // If car is AI controlled and target does not exist, Cars will not move unless a target is added.
        if (this.controlType === "AI" && this.target === null) {
            return;
        }
        // If car is not already damaged, it will move and damage is checked.
        if (!this.damaged) {
            this.#move();
            if (this.controls.forward && !this.controls.reverse) {
                this.fitness += 1;
            }
            this.polygon = this.#createPolygonAroundCar();
            this.damaged = this.#assessDamage();
        }
        // If car has sensors, update sensor readings and if car is of type AI, update controls based on it.
        if (this.sensor) {
            this.sensor.update(
                this.center,
                this.angle,
                roadBorders,
                this.pathBorders,
                markings
            );
            const sensorReadings = this.sensor.getReadings();
            if (this.target && this.target.polygon.containsPoint(this.center)) {
                this.success = true;
            }

            if (this.brain) {
                const calculatedControls = Brain.getControls({ ...sensorReadings, speed: this.speed / this.maxSpeed }, this.brain.network);
                if (this.controlType === "AI") {
                    this.controls = calculatedControls;
                }
            }
        }
    }

    draw(ctx) {
        if (!this.damaged && this.showSensor && this.sensor && !this.isSimulation) {
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