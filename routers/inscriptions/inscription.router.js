const router = require('express').Router();

module.exports = (wagner) => {
    const inscriptionCtrl = wagner.invoke((Inscription, Period) =>
        require('../../controllers/inscriptions/inscription.controller')(Inscription, Period));

    const studentCtrl = wagner.invoke((Student, Request) =>
        require('../../controllers/shared/student.controller')(Student, Request));

    const notificationCtrl = wagner.invoke(() =>
        require('../../controllers/notificationMail/notification.controller')());

    router.post('/sendmail', (req, res) =>
        inscriptionCtrl.sendTemplateMail(req, res));

    router.put('/updateStudent/:_id', (req, res) =>
        studentCtrl.updateStudent(req, res));
    
    router.get('/getStudent/:_id', (req, res) =>
        studentCtrl.getById(req, res));

    router.get('/getStudents', (req, res) =>
        studentCtrl.getStudentsInscription(req, res));
        //studentCtrl.getAll(req, res));
    
    router.get('/getStudentsLogged', (req, res) =>
        studentCtrl.getStudentsInscriptionLogged(req, res));
    
    router.get('/getStudentsProcess', (req, res) =>
        studentCtrl.getStudentsInscriptionProcess(req, res));
    
    router.get('/getStudentsAcept', (req, res) =>
        studentCtrl.getStudentsInscriptionAcept(req, res));

    router.get('/getStudentsPendant', (req, res) =>
        studentCtrl.getStudentsInscriptionPendant(req, res));

    router.post('/notificationMail', (req, res) =>
        notificationCtrl.sendNotification(req, res));

    router.get('/getIntegratedExpedient', (req, res) =>
        studentCtrl.getIntegratedExpedient(req, res));

    router.get('/getArchivedExpedient', (req, res) =>
        studentCtrl.getArchivedExpedient(req, res));

    router.get('/getNumberInscriptionStudentsByPeriod', (req, res) =>
        studentCtrl.getNumberInscriptionStudentsByPeriod(req, res));

    return router;
};
