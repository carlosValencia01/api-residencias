const router = require('express').Router();

module.exports = (wagner) => {
    const roleCtrl = wagner.invoke((Role, Position) =>
        require('../../controllers/app/role.controller')(Role, Position));

    router.get('/', (req, res) =>
        roleCtrl.getAll(req, res));

    router.post('/', (req, res) =>
        roleCtrl.createRole(req, res));

    router.put('/:_id', (req, res) =>
        roleCtrl.updateRole(req, res));

    router.delete('/:_id', (req, res) =>
        roleCtrl.removeRole(req, res));

    return router;
};
