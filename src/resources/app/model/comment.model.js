const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'document', required: true },
    star: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', comment);