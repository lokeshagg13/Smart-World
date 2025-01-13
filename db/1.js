const fs = require('fs');
const { encryptId, decryptId } = require('../utils/security');

// Parse the secret key and IV from the environment
const secretKey = Buffer.from("171ce4329668a7f1831333cb61fb361ade586b4e82d1f4c907e1423b51b932db", 'hex');
const iv = Buffer.from("aaf38f608f72b2a70e2696a30b00c00b", 'hex');

const worlds = JSON.parse(fs.readFileSync('worlds.json'));

for (let i = 0; i < worlds.length; i++) {
    worlds[i]['id'] = encryptId(worlds[i]['id'], secretKey, iv);
    console.log(decryptId(worlds[i].id, secretKey, iv))
}

fs.writeFileSync('worlds.json', JSON.stringify(worlds, '', 4))

