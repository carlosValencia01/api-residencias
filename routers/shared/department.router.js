const router = require('express').Router();

module.exports = (wagner) => {
    const deptoCtrl = wagner.invoke((Department, Position) =>
        require('../../controllers/shared/department.controller')(Department, Position));
        
        router.get('/employees', (req, res) => deptoCtrl.getAll(req, res));

        router.get('/all', (req, res) =>
            deptoCtrl.getAllDepartments(req, res));

        router.post('/create', (req, res) =>
            deptoCtrl.createDepartment(req, res));

        router.put('/update/:_id', (req, res) =>
            deptoCtrl.updateDepartment(req, res));

        router.delete('/remove/:_id', (req, res) =>
            deptoCtrl.removeDepartment(req, res));

    return router;
};
