const express = require('express');
const route = express.Router();
const authController = require('../app/controller/auth.controller');
const { authMiddleware } = require('../app/middleware/auth.middleware');

route.post('/register', authController.register);
route.post('/login', authController.login);
route.post('/refresh-token', authController.refreshToken);
route.post('/logout', authMiddleware, authController.logout);
route.get('/me', authMiddleware, authController.me);

module.exports = route;
