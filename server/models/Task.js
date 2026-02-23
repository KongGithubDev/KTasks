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
    subtasks: [SubtaskSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
