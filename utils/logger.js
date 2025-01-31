function logSuccess(message) {
    console.log("\x1b[37m%s - \x1b[32m%s\x1b[0m", new Date().toISOString(), message); // 32 is green
}

function logError(message) {
    console.log("\x1b[37m%s - \x1b[31m%s\x1b[0m", new Date().toISOString(), message); // 31 is red
}

module.exports = { logSuccess, logError };