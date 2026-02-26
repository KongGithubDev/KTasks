const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const path = require('path');

// Models
const User = require('./models/User');
const List = require('./models/List');
const Task = require('./models/Task');

dotenv.config();

const app = express();

// Security Headers for Google Auth
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id and email
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
};

// --- AUTH ROUTES ---

app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.create({ googleId, email, name, picture });

            // Create initial default list for new user
            await List.create({ userId: user._id, name: 'My Tasks', icon: 'Clock' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid token' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const { xp, level, badges } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (xp !== undefined) user.xp = xp;
        if (level !== undefined) user.level = level;
        if (badges !== undefined) user.badges = badges;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- LIST ROUTES ---

app.get('/api/lists', authenticateToken, async (req, res) => {
    try {
        const lists = await List.find({ userId: req.user.id });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/lists', authenticateToken, async (req, res) => {
    try {
        const { name, icon, color, defaultView } = req.body;
        const list = await List.create({
            userId: req.user.id,
            name,
            icon: icon || 'List',
            color: color || '',
            defaultView: defaultView || 'list'
        });
        res.status(201).json(list);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/api/lists/:id', authenticateToken, async (req, res) => {
    try {
        const { name, icon, color, defaultView } = req.body;
        const list = await List.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                name,
                icon: icon || 'List',
                color: color || '',
                defaultView: defaultView || 'list'
            },
            { new: true }
        );
        if (!list) return res.status(404).json({ message: 'List not found or unauthorized' });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
    try {
        // Delete tasks first
        await Task.deleteMany({ listId: req.params.id, userId: req.user.id });
        const list = await List.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!list) return res.status(404).json({ message: 'List not found or unauthorized' });
        res.json({ message: 'List and associated tasks deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- TASK ROUTES ---

app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/tasks/:listId', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id, listId: req.params.listId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const {
            listId, title, note, important, priority,
            dueDate, dueTime, tags, recurrence, attachments, status, blockedBy, location
        } = req.body;

        const task = await Task.create({
            userId: req.user.id,
            listId,
            title,
            note: note || '',
            important: !!important,
            priority: priority || 'low',
            dueDate,
            dueTime,
            tags: tags || [],
            recurrence: recurrence || 'none',
            attachments: attachments || [],
            status: status || 'todo',
            blockedBy: blockedBy || [],
            location,
            subtasks: []
        });
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const { subtasks, ...updates } = req.body;

        const taskData = { ...updates };
        if (subtasks) taskData.subtasks = subtasks;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            taskData,
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- PRODUCTION SETUP ---
// Serve static files from the React app dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the other process.`);
    } else {
        console.error('Server failed to start:', err.message);
    }
});
