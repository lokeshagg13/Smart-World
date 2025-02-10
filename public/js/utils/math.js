function tryParseInt(num, defaultVal) {
    try {
        return parseInt(num);
    } catch {
        return defaultVal;
    }
}

function tryParseFloat(num, defaultVal) {
    try {
        return parseFloat(num);
    } catch {
        return defaultVal;
    }
}

function convertDegreesToRadians(angle) {
    if (typeof (angle) === 'string') {
        angle = parseInt(angle);
    }
    return ((Math.PI * angle) / 180);
}

function convertRadiansToDegrees(angle) {
    return ((180 * angle) / Math.PI);
}

function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function average(p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

function add(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
}

function subtract(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y);
}

function scale(p, scaler) {
    return new Point(p.x * scaler, p.y * scaler);
}

function normalize(p) {
    return scale(p, 1 / magnitude(p));
}

function magnitude(p) {
    return Math.hypot(p.x, p.y);
}

function perpendicular(p) {
    return new Point(-p.y, p.x);
}

function translate(loc, angle, offset) {
    return new Point(
        loc.x + Math.cos(angle) * offset,
        loc.y + Math.sin(angle) * offset
    );
}

function angle(p) {
    return Math.atan2(p.y, p.x);
}

function getIntersection(A, B, C, D, extend = false) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    const eps = 0.001;
    if (Math.abs(bottom) > eps) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (extend) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset1: t,
                offset2: u
            }
        }
        if (!extend && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            };
        }
    }

    return null;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerp2D(A, B, t) {
    return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

function invLerp(a, b, v) {
    return (v - a) / (b - a);
}

function normalizeValue(value, fromMin, fromMax, toMin, toMax) {
    return lerp(toMin, toMax, invLerp(fromMin, fromMax, value));
}

function getRandomColor() {
    const hue = 290 + Math.random() * 260;
    return "hsl(" + hue + ", 100%, 60%";
}

function getFake3dPoint(point, viewPoint, height) {
    const dir = normalize(subtract(point, viewPoint));
    const dist = distance(point, viewPoint);
    const scaler = Math.atan(dist / 300) / (Math.PI / 2);
    return add(point, scale(dir, height * scaler));
}

function getRGBA_old(value) {
    const alpha = Math.abs(value);
    const R = value < 0 ? 0 : 255;
    const G = R;
    const B = value > 0 ? 0 : 255;
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

function getRGBA(value) {
    const alpha = Math.abs(value) ** 0.4;
    const R = value < 0 ? 0 : 255;
    const B = value > 0 ? 0 : 255;
    const G = Math.floor(R * 0.7) + Math.floor(B * 0.5);
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

function generateUniqueNumbers(N, m) {
    if (N > m) {
        return null;
    }
    const array = Array.from({ length: m }, (_, i) => i);
    array.sort(function (a, b) {
        return Math.random() - 0.5;
    });

    return array.slice(0, N);
}

function getDistanceForDisplay(distance) {
    // expects distance in metres
    if (distance < 1) {
        return "1m";
    }
    if (distance >= 1 && distance <= 999) {
        return `${distance.toFixed(0)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`
}

function getETAForDisplay(eta) {
    // expects eta in seconds
    return formatDisplayETA(eta);
}