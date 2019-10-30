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

    router.delete('/remove/:_id', (req, res) =>
        positionCtrl.removePosition(req, res));

    router.put('/updateDocumentAssign/:_positionId', (req, res) =>
        positionCtrl.updateDocumentAssign(req, res));

    router.get('/getPositions/:_departmentId', (req, res) =>
        positionCtrl.getPositionsForDepartment(req, res));

    return router;
};
