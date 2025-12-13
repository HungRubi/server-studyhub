const objectRoute = require("./object.route");

function route(app) {
    app.use("/objects", objectRoute);
}

module.exports = route;