const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const document = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    page: { type: Number, required: true },
    orderNumber: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    previewPage: [{ type: String, required: true }],
    virified: { 
        type: String, 
        required: true, 
        enum: ['yes', 'no'], 
        default: 'no' 
    },
    downloadUrl: { type: String, required: true },
    objectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "object",
        required: true
    },
    slug: { type: String, required: true, unique: true },
},{timestamps: true,});

module.exports = mongoose.model('document', document);