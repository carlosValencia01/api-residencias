const router = require('express').Router();

module.exports = (wagner) => {
    const englishCtrl = wagner.invoke((English) =>
        require('../controllers/english.controller')(English));

    router.get('/validate/:controlNumber', (req, res) =>
        englishCtrl.validateControlNumber(req, res));

    router.post('/loadData', (req, res) =>
        englishCtrl.loadData(req, res));

    return router;
};
