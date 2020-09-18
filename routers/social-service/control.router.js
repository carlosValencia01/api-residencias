const router = require('express').Router();

module.exports = (wagner) => {
    const controlStudentCtrl = wagner.invoke((ControlStudent, Student) =>
        require('../../controllers/social-service/control.controller')(ControlStudent, Student));

    router.get('', (req, res) =>
        controlStudentCtrl.getAll(req, res));

    router.get('/:studentId', (req, res) =>
        controlStudentCtrl.getControlStudentByStudentId(req, res));

    router.get('/student/:_id', (req, res) =>
        controlStudentCtrl.getStudentInformationByControlId(req, res));

    router.get('/verify/:_id/:email', (req, res) =>
        controlStudentCtrl.sendCodeForEmailConfirmation(req, res));

    router.post('/verify/', (req, res) =>
        controlStudentCtrl.verifyCode(req, res));

    router.post('/register/assistance', (req, res) =>
       controlStudentCtrl.createAssistanceByControlNumber(req, res));

    router.put('/release/csv', (req, res) =>
        controlStudentCtrl.releaseSocialServiceAssistanceCsv(req, res));

    router.put('/:id', (req, res) =>
        controlStudentCtrl.updateGeneralControlStudent(req, res));

    return router;
};
