const router = require('express').Router();

module.exports = (wagner) => {
    const inscriptionCtrl = wagner.invoke((Inscription, Period) =>
        require('../../controllers/inscriptions/inscription.controller')(Inscription, Period));

    router.post('/sendmail', (req, res) =>
        inscriptionCtrl.sendTemplateMail(req, res));

    return router;
};
