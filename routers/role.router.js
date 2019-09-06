const router = require('express').Router();

module.exports = (wagner) => {
    const roleCtrl = wagner.invoke((Role) =>
        require('../controllers/role.controller')(Role));
    router.get('/', (req, res) => roleCtrl.getAll(req, res))
    return router;

}