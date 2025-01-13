const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sampleOsm.json'));
const nodes = data.elements.filter((n) => n.type == "node");
console.log(nodes.length);
const highways = data.elements
                    .filter((e) => e.type == "way")
                    .map((w) => w.tags.highway);
console.log([...new Set(highways)]);