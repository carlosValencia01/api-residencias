const router = require('express').Router();

module.exports = (wagner) => {

    const englishStateCtrl = wagner.invoke((EnglishState) =>
        require('../../controllers/english/englishState.controller')(EnglishState));

    router.get('/all', (req, res) =>
    englishStateCtrl.getAllEnglishStates(req, res));

    router.post('/search/student', (req, res) =>
    englishStateCtrl.getEnglishStateByStudentId(req, res));

    router.post('/create', (req, res) =>
    englishStateCtrl.createEnglishState(req, res));

    router.put('/update/:_id', (req, res) =>
    englishStateCtrl.updateEnglishState(req, res));

    return router;
}