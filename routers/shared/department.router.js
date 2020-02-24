const router = require('express').Router();

module.exports = (wagner) => {
    const deptoCtrl = wagner.invoke((Department, Employee, Position) =>
        require('../../controllers/shared/department.controller')(Department, Employee, Position));

    router.get('/employees', (req, res) => deptoCtrl.getAll(req, res));

    router.get('/all', (req, res) =>
        deptoCtrl.getAllDepartments(req, res));

    router.post('/create', (req, res) =>
        deptoCtrl.createDepartment(req, res));

    router.post('/search', (req, res) =>
        deptoCtrl.searchEmployeeByPosition(req, res));

    router.put('/update/:_id', (req, res) =>
        deptoCtrl.updateDepartment(req, res));

    router.delete('/remove/:_id', (req, res) =>
        deptoCtrl.removeDepartment(req, res));

    router.get('/DepartmentBossSecretary/:_department', (req, res) => 
        deptoCtrl.getDepartmentBossSecretary(req, res));

    return router;
};
