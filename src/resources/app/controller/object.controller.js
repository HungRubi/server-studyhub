const Object = require('../model/object.model');

class ObjectController {

    async index(req, res) {
        try {
            
        }catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new ObjectController();