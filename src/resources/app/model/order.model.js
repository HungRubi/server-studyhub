const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const order = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    orderCode: { type: String, required: true, unique: true },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String,
        enum: ['process', 'completed', 'cancelled'],
        default: 'process'
    },
    paymentMethod: { 
        type: String, 
        enum: ['momo', 'atm banking', 'vietqr'], 
        default: 'vietqr' 
    },
    discountId: { type: Schema.Types.ObjectId, ref: 'discount', default: null },
    documentId: { type: Schema.Types.ObjectId, ref: 'document', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', order);    