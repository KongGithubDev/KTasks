const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'List' },
    color: { type: String },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    defaultView: { type: String, enum: ['list', 'kanban'], default: 'list' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('List', ListSchema);
