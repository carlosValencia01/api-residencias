const router = require('express').Router();

module.exports = (wagner) => {
    const inscriptionCtrl = wagner.invoke((Inscription, Period) =>
        require('../../controllers/inscriptions/inscription.controller')(Inscription, Period));

    const studentCtrl = wagner.invoke((Student, Request) =>
        require('../../controllers/shared/student.controller')(Student, Request));

    router.post('/sendmail', (req, res) =>
        inscriptionCtrl.sendTemplateMail(req, res));

    router.put('/updateStudent/:_id', (req, res) =>
        studentCtrl.updateStudent(req, res));
    
    router.get('/getStudent/:_id', (req, res) =>
        studentCtrl.getById(req, res));

    router.get('/getStudents', (req, res) =>
        studentCtrl.getStudentsInscription(req, res));
        //studentCtrl.getAll(req, res));

    return router;
};
