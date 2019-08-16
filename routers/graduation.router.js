const router = require('express').Router();

module.exports = (wagner) => {
    const mailCtrl = wagner.invoke((Inscription) =>
        require('../controllers/graduation.controller')(Inscription));

    router.post('/', (req, res) =>
        mailCtrl.sendGraduationMail(req, res));

    return router;
}