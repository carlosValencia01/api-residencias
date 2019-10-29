const router = require('express').Router();

module.exports = (wagner) => {
    const mailCtrl = wagner.invoke(() =>
        require('../../controllers/graduation/graduation.controller')());

    router.post('/', (req, res) =>
        mailCtrl.sendGraduationMail(req, res));

    router.post('/survey', (req, res) =>
        mailCtrl.sendGraduationMailSurvey(req, res));

    return router;
}