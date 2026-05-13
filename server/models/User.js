const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    dailyStreak: { type: Number, default: 0 },
    badges: [{ type: String }],
    templates: [{
        name: { type: String, required: true },
        title: { type: String },
        note: { type: String, default: '' },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
        dueTime: { type: String },
        recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' },
        recurrenceDayOfWeek: { type: Number, min: 0, max: 6 },
        tags: [{ type: String }],
        important: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
