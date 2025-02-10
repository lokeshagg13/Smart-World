const OSM = {
    parseRoads: (data) => {
        try {
            const nodes = data.elements.filter((n) => n.type == "node");
            const lats = nodes.map(n => n.lat);
            const lons = nodes.map(n => n.lon);

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);

            const deltaLat = maxLat - minLat;
            const deltaLon = maxLon - minLon;
            const aspectRatio = deltaLon / deltaLat;
            // 1 deg of latitude = 111 kilometres = 111000 metres
            const mapHeight = deltaLat * 111000 * 10;
            const mapWidth = mapHeight * aspectRatio * Math.cos(convertDegreesToRadians(maxLat));

            const points = [];
            const segments = [];
            for (const node of nodes) {
                const y = invLerp(maxLat, minLat, node.lat) * mapHeight;
                const x = invLerp(minLon, maxLon, node.lon) * mapWidth;
                const point = new Point(x, y);
                point.id = node.id;
                points.push(point);
            }

            const ways = data.elements.filter(w => w.type === "way");
            for (const way of ways) {
                const ids = way.nodes;
                for (let i = 1; i < ids.length; i++) {
                    const prev = points.find((p) => p.id == ids[i - 1]);
                    const curr = points.find((p) => p.id == ids[i]);
                    const oneWay =
                        way.tags.oneway ||
                        way.tags.lanes === 1 ||
                        (way.tags.junction && way.tags.junction === "roundabout");
                    segments.push(new Segment(prev, curr, oneWay));
                }
            }

            return { points, segments, message: "Parsed successfully" };
        } catch (error) {
            console.error('Error parsing OSM data: ', error.message);
            return { error: true, message: 'Error parsing OSM data: ' + error.message };
        }
    }
}