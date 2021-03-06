const router = require('express').Router();

module.exports = (wagner) => {
    const positionCtrl = wagner.invoke((Position, Employee) =>
        require('../../controllers/shared/position.controller')(Position, Employee));

    router.get('/all', (req, res) =>
        positionCtrl.getAllPositions(req, res));

    router.post('/create', (req, res) =>
        positionCtrl.createPosition(req, res));

    router.put('/update/:_id', (req, res) =>
        positionCtrl.updatePosition(req, res));

    router.put('/:_id/role', (req, res) =>
        positionCtrl.updatePositionRole(req, res));

    router.delete('/remove/:_id', (req, res) =>
        positionCtrl.removePosition(req, res));

    router.put('/updateDocumentAssign/:_positionId', (req, res) =>
        positionCtrl.updateDocumentAssign(req, res));

    router.get('/getPositions/:_departmentId', (req, res) =>
        positionCtrl.getPositionsByDepartment(req, res));

    router.get('/getAvailablePositions/:_employeeId/:_departmentId', (req, res) =>
        positionCtrl.getAvailablePositionsByDepartment(req, res));

    router.get('/getPosition/:positionId', (req, res) => {
        positionCtrl.getPositionById(req, res)
    })

    return router;
};
