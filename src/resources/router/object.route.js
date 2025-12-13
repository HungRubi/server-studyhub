const express = require("express");
const route = express.Router();

const objectController = require("../app/controller/object.controller");

route.get("/", objectController.index);

module.exports = route;