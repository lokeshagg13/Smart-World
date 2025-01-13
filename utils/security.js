const crypto = require('crypto');

// Encrypt function
function encryptId(id, secretKey, iv) {
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(String(id), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt function
function decryptId(encryptedId, secretKey, iv) {
    const [ivHex, encrypted] = encryptedId.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encryptId, decryptId };