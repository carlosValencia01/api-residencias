const router = require('express').Router();

module.exports = (wagner) => {
    const inscriptionCtrl = wagner.invoke((Inscription, Period, WelcomeData) =>
        require('../../controllers/inscriptions/inscription.controller')(Inscription, Period, WelcomeData));

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

    router.get('/getStudents/:clientId', (req, res) =>
        studentCtrl.getStudentsInscription(req, res));
        //studentCtrl.getAll(req, res));
    
    router.get('/getStudentsLogged/:clientId', (req, res) =>
        studentCtrl.getStudentsInscriptionLogged(req, res));
    
    router.get('/getStudentsProcess/:clientId', (req, res) =>
        studentCtrl.getStudentsInscriptionProcess(req, res));
    
    router.get('/getStudentsAcept/:clientId', (req, res) =>
        studentCtrl.getStudentsInscriptionAcept(req, res));

    router.get('/getStudentsPendant/:clientId', (req, res) =>
        studentCtrl.getStudentsInscriptionPendant(req, res));

    router.post('/notificationMail', (req, res) =>
        notificationCtrl.sendNotification(req, res));

    router.get('/getIntegratedExpedient', (req, res) =>
        studentCtrl.getIntegratedExpedient(req, res));

    router.get('/getArchivedExpedient', (req, res) =>
        studentCtrl.getArchivedExpedient(req, res));

    router.get('/getNumberInscriptionStudentsByPeriod/:clientId', (req, res) =>
        studentCtrl.getNumberInscriptionStudentsByPeriod(req, res));
        
    router.post('/sendnotificationmail', (req, res) =>
        inscriptionCtrl.sendInscriptionMail(req, res));

    router.get('/welcomeStudent/:curp', (req, res) =>
        inscriptionCtrl.getDataWelcomeStudent(req, res));

    router.post('/welcomeStudent', (req, res) =>
        inscriptionCtrl.saveWelcomeData(req, res));

    return router;
};
