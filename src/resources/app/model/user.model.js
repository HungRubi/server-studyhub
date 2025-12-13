const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
    lastLogin: { type: Date, default: null },
    refreshToken: { type: String, default: null },
}, { timestamps: true });