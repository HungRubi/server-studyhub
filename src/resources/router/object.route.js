const express = require("express");
const route = express.Router();

const objectController = require("../app/controller/object.controller");

route.post("/add", objectController.add);

route.put("/:slug", objectController.update);

route.delete("/delete-many", objectController.deleteMany);
route.delete("/:slug", objectController.delete);

route.get("/:slug", objectController.detail);
route.get("/", objectController.index);

module.exports = route;