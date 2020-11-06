const router = require('express').Router();

module.exports = (wagner) => {
    const controlStudentCtrl = wagner.invoke((ControlStudent, Student) =>
        require('../../controllers/social-service/control.controller')(ControlStudent, Student));

    const driveCtrl = wagner.invoke((Folder, Student, Period) =>
        require('../../controllers/app/google-drive.controller')(Folder, Student, Period));

    router.get('', (req, res) =>
        controlStudentCtrl.getAll(req, res));

    router.get('/document/status/:document/:eStatus', (req, res) =>
        controlStudentCtrl.getControlStudentByDocumentAndStatus(req, res));

    router.get('/control/student/:_id', (req, res) =>
        controlStudentCtrl.getControlStudentById(req, res));

    router.get('/request/:status', (req,res) => 
        controlStudentCtrl.getRequests(req,res));

    router.get('/:_id/file/:resource', (req, res) =>
        driveCtrl.getResource(req, res));

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

    router.post('/upload/file2', (req, res) =>
        driveCtrl.createFile2(req, res));

    router.post('/report/:_id', (req, res) =>
        controlStudentCtrl.addOneReportToStudent(req, res));

    router.delete('/report/:_id', (req, res) =>
        controlStudentCtrl.removeOneReportToStudent(req, res));

    router.put('/release/csv', (req, res) =>
        controlStudentCtrl.releaseSocialServiceAssistanceCsv(req, res));

    router.put('/:id', (req, res) =>
        controlStudentCtrl.updateGeneralControlStudent(req, res));

    router.put('/document/drive/:_id', (req, res) =>
        controlStudentCtrl.assignDocumentDrive(req, res));

    router.put('/document/status/:_id', (req, res) =>
        controlStudentCtrl.updateDocumentLog(req, res));

    return router;
};
