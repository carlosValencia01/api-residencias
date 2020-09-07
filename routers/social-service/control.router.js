const router = require('express').Router();

module.exports = (wagner) => {
    const controlStudentCtrl = wagner.invoke((ControlStudent, Student) =>
        require('../../controllers/social-service/control.controller')(ControlStudent, Student));

    router.get('', (req, res) =>
        controlStudentCtrl.getAll(req, res));

    router.get(':studentId', (req, res) =>
        controlStudentCtrl.getControlStudentByStudentId(req, res));

    router.post('/register/assistance', (req, res) =>
       controlStudentCtrl.createAssistanceByControlNumber(req, res));

    router.put('/release/csv', (req, res) =>
        controlStudentCtrl.releaseSocialServiceAssistanceCsv(req, res));

    router.put(':id', (req, res) =>
        controlStudentCtrl.updateGeneralControlStudent(req, res));

    return router;
};
