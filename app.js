const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();

const { logSuccess, logError } = require('./utils/logger');
const { encryptId, decryptId } = require('./utils/security');

require('dotenv').config();

// Parse the secret key and IV from the environment
const ENCRYTION_SECRET = Buffer.from(process.env.SECRET_KEY, 'hex');
const ENCRYTION_IV = Buffer.from(process.env.IV, 'hex');
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = encryptId(process.env.ADMIN_PASSWORD, ENCRYTION_SECRET, ENCRYTION_IV);

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Serve Frontend
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); // Move index.html to "public" directory
});

// API Endpoints

const worldJSONPath = path.join(__dirname, 'db', 'worlds.json');
if (!fs.existsSync(worldJSONPath)) {
    fs.writeFileSync(worldJSONPath, '');
}
const worldScreenshotsFolderPath = path.join(__dirname, 'db', 'screenshots');
if (!fs.existsSync(worldScreenshotsFolderPath)) {
    fs.mkdirSync(worldScreenshotsFolderPath);
}

// Save "world" string to the database
app.post('/api/save-world', async (req, res) => {
    try {
        const { world: worldToSave } = req.body;
        if (!worldToSave) {
            logError('400 - Save World : No world found to save');
            return res.status(400).json({ error: 'worldString is required' });
        }

        // Read world data json file
        let worldDataString = fs.readFileSync(worldJSONPath, 'utf8');
        const worlds = worldDataString !== '' ? JSON.parse(worldDataString) : [];
        worldToSave.createdOn = new Date();
        worldToSave.id = encryptId(worldToSave.createdOn.getTime(), ENCRYTION_SECRET, ENCRYTION_IV);

        // Save screenshot file
        const base64Data = worldToSave.screenshot.replace(/^data:image\/png;base64,/, '');
        const screenshotPath = path.join(worldScreenshotsFolderPath, 'World_' + decryptId(worldToSave.id, ENCRYTION_SECRET, ENCRYTION_IV) + '.png')
        fs.writeFileSync(screenshotPath, base64Data, 'base64');

        // Add textual data to the json file
        worlds.push(worldToSave);
        fs.writeFileSync(worldJSONPath, JSON.stringify(worlds, '', 4));
        logSuccess('201 - Save World : Success');
        return res.status(201).json({ message: 'World saved successfully' });
    } catch (error) {
        logError('500 - Save World : ' + error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.post('/api/get-worlds', async (req, res) => {
    try {
        let worldDataString = fs.readFileSync(worldJSONPath, 'utf8');
        let worlds = worldDataString !== '' ? JSON.parse(worldDataString) : [];
        worlds = worlds.map((world) => ({
            id: decryptId(world.id, ENCRYTION_SECRET, ENCRYTION_IV),
            screenshot: world.screenshot,
            createdOn: world.createdOn
        }));
        logSuccess('200 - Get Worlds : Success');
        return res.status(200).json({ message: 'Worlds retrieved successfully', worlds: worlds });
    } catch (error) {
        logError('500 - Get Worlds : ' + error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
})

// Load the "world" string from the database
app.get('/api/load-world/:worldId', async (req, res) => {
    try {
        let worldDataString = fs.readFileSync(worldJSONPath, 'utf8');
        const worlds = worldDataString !== '' ? JSON.parse(worldDataString) : [];

        if (worlds.length === 0) {
            logError('404 - Load World : No saved worlds');
            return res.status(404).json({ error: 'No saved worlds.' });
        }

        const worldId = req.params['worldId'];
        let world = worlds.filter((world) => decryptId(world.id, ENCRYTION_SECRET, ENCRYTION_IV) === worldId);
        if (world.length == 0) {
            logError('404 - Load World : World not found');
            return res.status(404).json({ message: 'World not found' })
        }
        world = world[0]
        world.id = decryptId(world.id, ENCRYTION_SECRET, ENCRYTION_IV);
        logSuccess('200 - Load World : Success');
        return res.status(200).json({ message: 'World retrieved successfully', world: world });
    } catch (error) {
        logError('500 - Load World : ' + error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Delete the world from the database
app.delete('/api/delete-world/:worldId', async (req, res) => {
    try {
        let worldDataString = fs.readFileSync(worldJSONPath, 'utf8');
        const worlds = worldDataString !== '' ? JSON.parse(worldDataString) : [];

        if (worlds.length === 0) {
            logError('404 - Delete World : No saved worlds');
            return res.status(404).json({ error: 'No saved worlds.' });
        }

        const worldId = req.params['worldId'];
        const worldsRemaining = [];
        for (const world of worlds) {
            const decryptedID = decryptId(world.id, ENCRYTION_SECRET, ENCRYTION_IV);
            if (decryptedID === worldId) {
                const screenshotPath = path.join(worldScreenshotsFolderPath, 'World_' + decryptedID + '.png')
                if (fs.existsSync(screenshotPath)) {
                    fs.unlinkSync(screenshotPath);
                }
            } else {
                worldsRemaining.push(world);
            }
        }
        fs.writeFileSync(worldJSONPath, JSON.stringify(worldsRemaining, '', 4))
        logSuccess('200 - Delete World : Success');
        return res.status(200).json({ message: 'World deleted successfully' });
    } catch (error) {
        logError('500 - Delete World : ' + error.message);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Check for Admin Access
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Hash the incoming password and compare with the stored hash
        const hashedPassword = encryptId(password, ENCRYTION_SECRET, ENCRYTION_IV);

        if (hashedPassword === ADMIN_PASSWORD_HASH) {
            // Create a JWT token
            const token = jwt.sign({ user: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
            logSuccess('200 - Admin Login : Success');
            return res.status(200).json({ success: true, token });
        } else {
            logError('401 - Admin Login : Invalid password');
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        logError('500 - Admin Login : ' + error.message);
        return res.status(500).json({ success: false, message: 'Invalid password' });
    }
});

// Verify access token
app.post('/api/admin/verify', (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            logError('401 - Verify Access : Invalid token received');
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        logSuccess('200 - Verify Access : Success');
        return res.status(200).json({ success: true, decoded });
    } catch (error) {
        logError('500 - Verify Access : ' + error.message);
        return res.status(500).json({ success: false, message: 'Invalid or expired token' });
    }
});


// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on https://smart-world-ske3.onrender.com at port ${process.env.PORT}`);
});