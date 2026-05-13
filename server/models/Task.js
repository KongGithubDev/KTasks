const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    title: { type: String, required: true },
    note: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    dueDate: { type: Date },
    dueTime: { type: String },
    tags: [{ type: String }],
    recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], default: 'none' },
    recurrenceDayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
    attachments: [{ url: String, filename: String, type: String }],
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
    timeSpent: { type: Number, default: 0 },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    location: { lat: Number, lng: Number, radius: Number, name: String },
    subtasks: [SubtaskSchema],
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
