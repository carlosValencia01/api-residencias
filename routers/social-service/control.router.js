const router = require('express').Router();

module.exports = (wagner) => {
    const controlStudentCtrl = wagner.invoke((ControlStudent) =>
        require('../../controllers/social-service/control.controller')(ControlStudent));

    router.get('', (req, res) =>
        controlStudentCtrl.getAll(req, res));

    router.get(':studentId', (req, res) =>
        controlStudentCtrl.getControlStudentByStudentId(req, res));

    router.put(':id', (req, res) =>
        controlStudentCtrl.updateGeneralControlStudent(req, res));

    return router;
};
