const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const object = new Schema({
    name: { type: String, required: true, unique: true },
    thumbnail: { type: String, required: true },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "object",
        default: null
    },
    index: { type: Number, default: 9999 },
    active: { type: String, enum: ['yes', 'no'], default: 'yes' },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('object', object);