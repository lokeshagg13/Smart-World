class World {
    constructor(graph) {
        this.graph = graph;
        this.settings = World.loadSettingsFromLocalStorage();

        this.roadPaths = [];
        this.roadBorders = [];
        this.roadDividers = [];
        this.buildings = [];
        this.trees = [];
        this.laneGuides = [];

        this.markings = [];
        this.pedestrians = [];
        this.selectedCar = null;
        this.followedCar = null;

        this.frameCount = 0;

        if (graph.points.length > 0) {
            this.generate();
        }
    }

    static load(info) {
        const world = new World(new Graph());
        world.graph = Graph.load(info.graph);
        world.settings = Settings.load(info.settings);
        world.settings.save();

        world.roadPaths = info.roadPaths.map(
            (e) => Envelope.load(e)
        );
        world.roadBorders = info.roadBorders.map(
            (rb) => new Segment(
                new Point(
                    rb.p1.x,
                    rb.p1.y
                ), new Point(
                    rb.p2.x,
                    rb.p2.y
                )
            )
        );
        world.roadDividers = info.roadDividers.map(
            (rd) => new Segment(
                new Point(
                    rd.p1.x,
                    rd.p1.y
                ), new Point(
                    rd.p2.x,
                    rd.p2.y
                )
            )
        );
        world.buildings = info.buildings.map(
            (b) => Building.load(b)
        );
        world.trees = info.trees.map(
            (t) => Tree.load(t)
        );
        world.laneGuides = info.laneGuides.map(
            (lg) => new Segment(
                new Point(
                    lg.p1.x,
                    lg.p1.y
                ), new Point(
                    lg.p2.x,
                    lg.p2.y
                )
            )
        );
        world.markings = info.markings.filter(
            (m) => (m.type !== "start" && m.type !== "target")
        ).map(
            (m) => Marking.load(m)
        );
        world.zoom = info.zoom;
        world.offset = new Point(info.offset.x, info.offset.y);
        return world;
    }

    dispose() {
        this.graph.dispose();
        this.settings = World.loadSettingsFromLocalStorage();

        this.roadPaths = [];
        this.roadBorders = [];
        this.roadDividers = [];
        this.buildings = [];
        this.trees = [];
        this.laneGuides = [];

        this.markings = [];
        this.pedestrians = [];
        this.selectedCar = null;    // For non-simulation mode
        this.followedCar = null;    // For simulation mode

        this.frameCount = 0;
    }

    static loadSettingsFromLocalStorage() {
        const worldSettingsString = localStorage.getItem("settings");
        const worldSettingsObj = worldSettingsString
            ? JSON.parse(worldSettingsString)
            : null;
        const worldSettings = worldSettingsObj
            ? Settings.load(worldSettingsObj)
            : new Settings();
        worldSettings.save();
        return worldSettings;
    }

    // #region - World Generation Helper Functions

    async #generateRoads(progressTracker) {
        this.roadPaths.length = 0;
        const roadPaths = [];
        progressTracker.reset(this.graph.segments.length, 'Generating roads');
        for (const segment of this.graph.segments) {
            roadPaths.push(
                new Envelope(segment, this.settings.roadWidth, this.settings.roadRoundness)
            );
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        return roadPaths;
    }

    async #generateRoadBorders(progressTracker) {
        progressTracker.reset(100, 'Generating road borders');
        return await Polygon.unionAsync(this.roadPaths.map((envelope) => envelope.polygon), progressTracker);
    }

    async #generateRoadDividers(progressTracker) {
        const roadDividers = []
        progressTracker.reset(this.graph.segments.length, 'Generating road dividers');
        for (const segment of this.graph.segments) {
            if (segment.oneWay) {
                continue;
            }
            const segmentAngle = angle(segment.directionVector());
            const p1 = translate(segment.p1, segmentAngle, this.settings.roadWidth / 2);
            const p2 = translate(segment.p2, segmentAngle, -this.settings.roadWidth / 2);
            roadDividers.push(new Segment(p1, p2));
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        return roadDividers
    }

    async #generateBuildings(progressTracker) {
        // Creating building region envelopes
        const tmpEnvelopes = [];
        progressTracker.reset(this.graph.segments.length, 'Searching for suitable building lands');
        for (const segment of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    segment,
                    this.settings.roadWidth + this.settings.buildingWidth + this.settings.spacing * 2,
                    this.settings.roadRoundness
                )
            );
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        const guides = await Polygon.unionAsync(tmpEnvelopes.map((e) => e.polygon), progressTracker);
        const buildingSuitableGuides = guides.filter((segment) => (segment.length() > this.settings.buildingMinLength));

        // Creating supports for buildings using the buildings
        const buildingSupports = [];
        progressTracker.reset(buildingSuitableGuides.length, 'Generating building supports');
        for (let segment of buildingSuitableGuides) {
            const length = segment.length() + this.settings.spacing;
            const buildingCount = Math.floor(
                length / (this.settings.buildingMinLength + this.settings.spacing)
            );
            const buildingLength = length / buildingCount - this.settings.spacing;

            const direction = segment.directionVector();

            let q1 = segment.p1;
            let q2 = add(q1, scale(direction, buildingLength));
            buildingSupports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(direction, this.settings.spacing));
                q2 = add(q1, scale(direction, buildingLength));
                buildingSupports.push(new Segment(q1, q2));
            }
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        // Creating rectangular bases for buildings using the supports
        const buildingBases = [];
        progressTracker.reset(buildingSupports.length, 'Generating buildings floors');
        for (let segment of buildingSupports) {
            buildingBases.push(new Envelope(segment, this.settings.buildingWidth).polygon);
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        // Removing any overlapping building bases
        const eps = 0.001;
        progressTracker.reset(buildingSupports.length - 1, 'Generating building walls and roofs');
        for (let i = 0; i < buildingBases.length - 1; i++) {
            for (let j = i + 1; j < buildingBases.length; j++) {
                if (
                    buildingBases[i].intersectsPolygon(buildingBases[j]) ||
                    buildingBases[i].distanceToPolygon(buildingBases[j]) < this.settings.spacing - eps
                ) {
                    buildingBases.splice(j, 1);
                    j--;
                }
            }
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        return buildingBases.map((base) => new Building(base));
    }

    async #generateTrees(progressTracker) {
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];
        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        const illegalPolygons = [
            ...this.buildings.map((b) => b.base),
            ...this.roadPaths.map((e) => e.polygon)
        ];

        const trees = [];
        let tryCount = 0;
        progressTracker.reset(1000, 'Generating trees');
        while (tryCount < 100 && trees.length < 1000) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );

            // Check if tree is inside or nearby building or road
            let keep = true;
            for (const polygon of illegalPolygons) {
                if (polygon.containsPoint(p) ||
                    polygon.distanceToPoint(p) < this.settings.treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            // Check if tree is too close to other trees
            if (keep) {
                for (const tree of trees) {
                    if (distance(tree.center, p) < this.settings.treeSize) {
                        keep = false;
                        break
                    }
                }
            }

            // Check if tree is in the middle of nowhere
            if (keep) {
                let closeToSomething = false;
                for (const polygon of illegalPolygons) {
                    if (polygon.distanceToPoint(p) < this.settings.treeSize * 2) {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething
            }

            if (keep) {
                trees.push(new Tree(p, this.settings.treeSize, this.settings.treeHeight));
                tryCount = 0;
                await progressTracker.updateProgress();
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            tryCount++;
        }
        progressTracker.counter = progressTracker.maxCount;
        await progressTracker.updateProgress();
        await new Promise((resolve) => setTimeout(resolve, 0));
        return trees;
    }

    async #generateLaneGuides(progressTracker) {
        this.laneGuides.length = 0;
        const tmpEnvelopes = [];
        progressTracker.reset(this.graph.segments.length, 'Generating lane guides');
        for (const segment of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    segment,
                    this.settings.roadWidth / 2,
                    this.settings.roadRoundness
                )
            );
            await progressTracker.updateProgress();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        const segments = await Polygon.unionAsync(tmpEnvelopes.map((e) => e.polygon), progressTracker);
        return segments;
    }

    // #endregion



    // #region - Traffic Light Helper Functions

    #getRoadIntersections(minDegree = 2) {
        // Intersections are graph points with two or more intersecting segments (or roads)
        const subset = [];
        for (const point of this.graph.points) {
            let degree = 0;
            for (const segment of this.graph.segments) {
                if (segment.includes(point)) {
                    degree++
                }
            }

            if (degree >= minDegree) {
                subset.push(point);
            }
        }
        return subset;
    }

    #updateTrafficLightsAndCrossings() {
        const trafficLights = this.markings.filter((m) => m instanceof TrafficLightMarking);
        const crossings = this.markings.filter((m) => m instanceof CrossingMarking);

        // Each road intersection has one corresponding control center and 
        // a traffic light is linked to its nearest control center.
        const controlCenters = [];
        for (const trafficLight of trafficLights) {
            // For each traffic light, get the nearest road intersection
            const nearestIntersectionPoint = Graph.getNearestPoint(trafficLight.center, this.#getRoadIntersections(3));
            if (!nearestIntersectionPoint) continue;
            let controlCenter = controlCenters.find((c) => c.center.equals(nearestIntersectionPoint));
            trafficLight.crossings = [];
            if (!controlCenter) {
                controlCenter = {
                    center: new Point(
                        nearestIntersectionPoint.x,
                        nearestIntersectionPoint.y
                    )
                };
                controlCenter.trafficLights = [trafficLight];
                controlCenters.push(controlCenter);
            } else {
                controlCenter.trafficLights.push(trafficLight);
            }
        }
        for (const crossing of crossings) {
            // For each crossing, get the nearest road intersection
            const nearestIntersectionPoint = Graph.getNearestPoint(crossing.center, this.#getRoadIntersections(3));
            if (!nearestIntersectionPoint) continue;
            let controlCenter = controlCenters.find((c) => c.center.equals(nearestIntersectionPoint));
            if (controlCenter && controlCenter.trafficLights) {
                const roadPathOfCrossing = this.roadPaths.find((rp) => rp.polygon.containsPoint(crossing.center));
                let nearestTrafficLightIndex = -1;
                let minDistance = Number.MAX_SAFE_INTEGER;
                for (let t = 0; t < controlCenter.trafficLights.length; t += 1) {
                    const trafficLight = controlCenter.trafficLights[t];
                    if (!roadPathOfCrossing.polygon.containsPoint(trafficLight.center)) {
                        continue;
                    }
                    if (distance(trafficLight.center, crossing.center) < minDistance) {
                        minDistance = distance(trafficLight.center, crossing.center);
                        nearestTrafficLightIndex = t;
                    }
                }
                if (nearestTrafficLightIndex < 0) {
                    continue;
                }
                if (!controlCenter.trafficLights[nearestTrafficLightIndex].crossings) {
                    controlCenter.trafficLights[nearestTrafficLightIndex].crossings = [crossing];
                } else {
                    controlCenter.trafficLights[nearestTrafficLightIndex].crossings.push(crossing);
                }
            }
        }

        const greenDuration = 10, yellowDuration = 2;
        for (const controlCenter of controlCenters) {
            controlCenter.ticks = controlCenter.trafficLights.length * (greenDuration + yellowDuration);
        }
        const tick = Math.floor(this.frameCount / 60);
        for (const controlCenter of controlCenters) {
            const cTick = tick % controlCenter.ticks;
            // greenYellowIndex means the index of traffic light that must be activated
            // at the current tick of the control center
            const greenYellowIndex = Math.floor(
                cTick / (greenDuration + yellowDuration)
            );
            const greenYellowState =
                cTick % (greenDuration + yellowDuration) < greenDuration
                    ? TrafficLightMarking.states.GREEN
                    : TrafficLightMarking.states.YELLOW;
            for (let i = 0; i < controlCenter.trafficLights.length; i++) {
                if (i == greenYellowIndex) {
                    controlCenter.trafficLights[i].state = greenYellowState;
                    controlCenter.trafficLights[i].crossings.forEach(
                        (c) => {
                            c.state = CrossingMarking.states.RED;
                        }
                    );
                } else {
                    controlCenter.trafficLights[i].state = TrafficLightMarking.states.RED;
                    controlCenter.trafficLights[i].crossings.forEach(
                        (c) => {
                            c.state = CrossingMarking.states.GREEN
                        }
                    );
                }
            }
        }
    }

    // #endregion



    // #region - Cars related Helper Functions

    #updateCars() {
        const cars = this
            .markings
            .filter(
                (marking) => (
                    (marking instanceof StartMarking) &&
                    (!marking.car.damaged) &&
                    (currentMode !== "simulation" || marking.car.isSimulation)
                )
            ).map(
                (marking) => marking.car
            );

        for (const car of cars) {
            car.update(this.roadBorders, this.markings);
        }

        if (currentMode === "simulation") {
            this.followedCar = cars.find(
                car => (
                    car.fitness === (
                        Math.max(
                            ...cars.map(c => c.fitness)
                        )
                    )
                )
            );
        }
        else if (this.selectedCar) {
            if (this.selectedCar.success) {
                this.selectedCar = null;
                return;
            }
            const checkMarking = this.markings.find(
                m =>
                    (m instanceof StartMarking) &&
                    (m.car === this.selectedCar)
            );
            if (!checkMarking) {
                this.selectedCar = null;
            }
        }
    }

    #removeSuccessfulAndDamagedCars() {
        const indicesToRemove = [];
        const wasteTargetElements = [];
        this.markings.forEach((m, index) => {
            if (!(m instanceof StartMarking)) {
                return;
            }
            if (m.car.isSimulation) {
                return;
            }
            if (m.car.success || m.car.damaged) {
                indicesToRemove.push(index);
                if (m.car.target) {
                    wasteTargetElements.push(m.car.target);
                }
            }
        });

        this.markings.forEach((m, index) => {
            if (wasteTargetElements.includes(m)) {
                indicesToRemove.push(index);
            }
        });

        this.markings = this.markings.filter((_, index) => !indicesToRemove.includes(index));
    }

    // #endregion



    // #region - Pedestrians related Helper Functions

    #updatePedestrians() {
        this.pedestrians.forEach(
            (p) => {
                if (p.state === Pedestrian.states.MOVING) {
                    p.update();
                }
                else if (
                    p.state === Pedestrian.states.CREATED &&
                    p.crossing.state === CrossingMarking.states.GREEN
                ) {
                    p.update();
                }
            }
        );
    }

    #removeSuccessfulPedestrians() {
        this.pedestrians = this.pedestrians.filter(
            (p) => {
                if (p.state === Pedestrian.states.REACHED) {
                    return false;
                }
                return true;
            }
        );
    }

    #generateRandomPedestrians() {
        const crossings = this.markings.filter(m =>
            (m instanceof CrossingMarking) &&
            (m.pedCount === 0)
        );
        if (crossings.length === 0) {
            return;
        }

        const cycle = Math.max(120, 1200 / crossings.length);
        if (Math.floor(this.frameCount % cycle) !== 0) {
            return;
        }
        const randomCrossing = crossings[Math.floor(Math.random() * crossings.length)];

        this.pedestrians.push(
            new Pedestrian(
                randomCrossing,
                0.2
            )
        );
    }

    // #endregion



    // #region - External Functions

    async generate() {
        const progressTracker = new ProgressTracker();
        progressTracker.show();
        try {
            this.roadPaths = await this.#generateRoads(progressTracker);
            this.roadBorders = await this.#generateRoadBorders(progressTracker);
            this.roadDividers = await this.#generateRoadDividers(progressTracker);
            this.buildings = await this.#generateBuildings(progressTracker);
            this.trees = await this.#generateTrees(progressTracker);
            this.laneGuides.push(...await this.#generateLaneGuides(progressTracker));
        } catch (error) {
            console.log(error)
            console.error('Error generating the world: ' + error.message);
            return { error: true, message: 'Error generating the world: ' + error.message };
        } finally {
            progressTracker.hide();
        }
    }

    generateCars(numCars) {
        const randomNumbers = generateUniqueNumbers(numCars, this.graph.segments.length);
        for (const number in randomNumbers) {
            const targetMarking = this.getRandomTargetMarking();

            const randomSegment = this.graph.segments[number];
            const randomPoint = randomSegment.randomPoint(0.3, 0.7);

            let direction;
            let startPoint;
            let opposite = Math.random() < 0.5;
            if (this.settings.isLHT) {
                if (opposite) {
                    direction = scale(randomSegment.directionVector(), -1);
                    startPoint = translate(randomPoint, angle(perpendicular(direction)), -this.settings.roadWidth * 0.25);
                } else {
                    direction = randomSegment.directionVector();
                    startPoint = translate(randomPoint, angle(perpendicular(direction)), -this.settings.roadWidth * 0.25);
                }
            } else {
                if (opposite) {
                    direction = scale(randomSegment.directionVector(), -1);
                    startPoint = translate(randomPoint, angle(perpendicular(direction)), -this.settings.roadWidth * 0.25);
                } else {
                    direction = randomSegment.directionVector();
                    startPoint = translate(randomPoint, angle(perpendicular(direction)), -this.settings.roadWidth * 0.25);
                }

            }

            const startMarking = new StartMarking(
                startPoint,
                direction,
                this.settings.roadWidth * 0.4,
                this.settings.roadWidth / 4,
                this.settings.isLHT,
                false
            );
            startMarking.car.target = targetMarking;
            startMarking.car.path = this.graph.getShortestPath(
                startMarking.car.center,
                targetMarking.center
            );
            startMarking.car.pathBorders = this.generateCarPath(
                startMarking.car.center,
                startMarking.car.angle,
                startMarking.car.path
            );

            this.markings.push(startMarking);
            this.markings.push(targetMarking);
        }
    }

    getRandomTargetMarking() {
        const segment = this.graph.segments[Math.floor(Math.random() * this.graph.segments.length)];
        const randomPoint = segment.randomPoint(0.3, 0.7);
        return new TargetMarking(
            randomPoint,
            segment.directionVector(),
            this.settings.roadWidth,
            this.settings.roadWidth / 2,
            this.settings.isLHT
        );
    }

    generateCarPath(carCenter, carAngle, path) {
        const pathSegments = [];
        const trafficSideFactor = this.settings.isLHT ? -1 : 1;
        for (let i = 1; i < path.length; i++) {
            const segment = new Segment(path[i - 1], path[i]);
            const roadAngle = angle(perpendicular(segment.directionVector()));
            const p1 = translate(path[i - 1], roadAngle, trafficSideFactor * this.settings.roadWidth * 0.25);
            const p2 = translate(path[i], roadAngle, trafficSideFactor * this.settings.roadWidth * 0.25);
            pathSegments.push(new Segment(p1, p2));
        }
        for (let i = 1; i < pathSegments.length; i++) {
            const segment1 = pathSegments[i - 1];
            const segment2 = pathSegments[i];
            const intersection = getIntersection(segment1.p1, segment1.p2, segment2.p1, segment2.p2, true);
            if (intersection) {
                segment1.p2 = segment2.p1 = new Point(intersection.x, intersection.y);
            }
        }
        const tmpEnvelopes = pathSegments.map(
            (s) => new Envelope(s, this.settings.roadWidth * 0.5, this.settings.roadRoundness)
        );

        const isUturnNeeded = !tmpEnvelopes.find(
            (envelope) => envelope.polygon.containsPoint(
                carCenter
            )
        );
        if (isUturnNeeded) {
            const uturnCenter = translate(
                carCenter,
                carAngle,
                -trafficSideFactor * this.settings.roadWidth * 0.25
            );
            tmpEnvelopes.push(
                new Envelope(
                    new Segment(uturnCenter, uturnCenter),
                    this.settings.roadWidth,
                    this.settings.roadRoundness
                )
            );
        }
        const pathBorders = Polygon.union(tmpEnvelopes.map((e) => e.polygon));
        return pathBorders;
    }

    draw(ctx, viewpoint, renderRadius = 1000) {
        this.#updateTrafficLightsAndCrossings();
        if (currentMode !== "select") {
            this.#updateCars();
        }

        if (currentMode !== "simulation") {
            this.#generateRandomPedestrians();
            this.#updatePedestrians();
            this.#removeSuccessfulPedestrians();
            this.#removeSuccessfulAndDamagedCars();
        }

        this.frameCount++;

        // Road Paths
        for (const envelope of this.roadPaths) {
            envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        // Road Borders
        for (const segment of this.roadBorders) {
            segment.draw(ctx, { color: "#FFF", width: 4 });
        }
        // Road Dividers 
        for (const segment of this.roadDividers) {
            segment.draw(ctx, { color: "#FFF", width: 4, dash: [10, 10] });
        }
        // All Markings except target, cars and traffic lights
        for (const marking of this.markings) {
            if (
                !(marking instanceof TargetMarking) &&
                !(marking instanceof TrafficLightMarking) &&
                !(marking instanceof StartMarking)
            ) {
                marking.draw(ctx);
            }
        }

        // Pedestrians
        for (const pedestrian of this.pedestrians) {
            pedestrian.draw(ctx);
        }

        // Cars
        for (const marking of this.markings) {
            if (marking instanceof StartMarking) {
                if (currentMode === "simulation" && !marking.car.isSimulation) {
                    continue;
                }
                marking.draw(ctx);
            }
        }

        // Traffic Lights
        for (const marking of this.markings) {
            if (marking instanceof TrafficLightMarking) {
                marking.draw(ctx);
            }
        }

        // Target and Path for followed car 
        if (currentMode !== "simulation") {
            if (this.selectedCar && this.selectedCar.target) {
                this.selectedCar.target.draw(ctx);
                for (const segment of this.selectedCar.pathBorders) {
                    segment.draw(ctx, { color: "red", width: 4 });
                }
            }
        }

        // Visualizer
        if (this.selectedCar && this.selectedCar.brain) {
            Visualizer.display(this.selectedCar.brain);
        } else {
            Visualizer.display(new Brain());
        }

        // Buildings & Trees
        const items = [...this.buildings, ...this.trees].filter(
            (i) => i.base.distanceToPoint(viewpoint) < renderRadius
        );

        // Sort buildings and trees so that the items far from the 
        // viewpoint are drawn first and then the nearer walls 
        // to overlap them
        items.sort(
            (a, b) =>
                b.base.distanceToPoint(viewpoint) -
                a.base.distanceToPoint(viewpoint)
        );

        for (const item of items) {
            item.draw(ctx, viewpoint);
        }
    }

    // #endregion
}