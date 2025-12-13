const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notification = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { 
        type: String, 
        enum: ['thông báo hệ thống', 'thông báo khách hàng', 'thông báo mua hàng'], 
        default: 'thông báo hệ thống' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notification);