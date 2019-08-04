const router = require('express').Router();

module.exports = (wagner) => {
    const mailCtrl = wagner.invoke((Inscription) =>
        require('../controllers/mail.controller')(Inscription));

    router.post('/', (req, res) =>
        mailCtrl.sendInscriptionMail(req, res));

    return router;
}
