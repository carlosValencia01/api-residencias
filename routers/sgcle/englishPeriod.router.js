const router = require('express').Router();

module.exports = (wagner) => {

const englishPeriodCtrl = wagner.invoke((EnglishPeriod) =>
    require('../../controllers/sgcle/englishPeriod.controller')(EnglishPeriod));

    router.post('/create', (req, res) =>
    englishPeriodCtrl.createEnglishPeriod(req, res));

    router.get('/all', (req, res) =>
    englishPeriodCtrl.getAllEnglishPeriod(req, res));

    router.get('/in/:_option', (req, res) =>
    englishPeriodCtrl.inEnglishPeriod(req, res));
    
    router.put('/update/:_id', (req, res) =>
    englishPeriodCtrl.updateEnglishPeriod(req, res));

    return router;
}