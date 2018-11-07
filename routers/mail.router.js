const router = require('express').Router();

module.exports = () => {
    const mailCtrl = require('../controllers/mail.controller')();

    router.post('/', (req, res) =>
        mailCtrl.sendmail(req, res));

    return router;
}