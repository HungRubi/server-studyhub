const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discount = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['giảm giá theo phần trăm', 'giảm giá theo số tiền cố định'],
        required: true,
        default: 'giảm giá theo phần trăm'
    },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    useLimit: { type: Number, default: 5 },
    useCount: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true }

}, { timestamps: true });

module.exports = mongoose.model('Discount', discount);