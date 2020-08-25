const router = require('express').Router();

module.exports = (wagner) => {

    const englishStudentCtrl = wagner.invoke((EnglishStudent) =>
        require('../../controllers/sgcle/englishStudent.controller')(EnglishStudent));

    router.get('/search/student/:_studentId', (req, res) =>
    englishStudentCtrl.getEnglishStudentByStudentId(req, res));

    router.get('/search/:_id', (req, res) =>
    englishStudentCtrl.getEnglishStudentAndStudentById(req, res));

    router.post('/create', (req, res) =>
    englishStudentCtrl.createEnglishStudent(req, res));

    router.put('/update/:_id', (req, res) =>
    englishStudentCtrl.updateEnglishStudent(req, res));

    router.put('/update/status/:_id', (req, res) =>
    englishStudentCtrl.updateStatus(req, res));
    
    router.put('/set/paidstatus', (req, res) =>
    englishStudentCtrl.updateStatusToPaid(req, res));

    router.get('/students/noverified', (req, res) => {
        englishStudentCtrl.getEnglishStudentNoVerified(req, res);
    });

    return router;
}