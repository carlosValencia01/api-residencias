const router = require('express').Router();

module.exports = (wagner) => {
    const englishCtrl = wagner.invoke((Student, English) =>
        require('../../controllers/reception-act/english.controller')(Student, English));

    router.get('/search/:search', (req, res) =>
        englishCtrl.search(req, res));

    router.get('/released', (req, res) =>
        englishCtrl.getAllReleased(req, res));

    router.get('/notReleased', (req, res) =>
        englishCtrl.getAllNotReleased(req, res));

    router.put('/release/csv', (req, res) =>
        englishCtrl.releaseEnglishCsv(req, res));

    router.put('/release/:_controlNumber', (req, res) =>
        englishCtrl.releaseStudent(req, res));

    router.delete('/removeRelease/:_controlNumber', (req, res) =>
        englishCtrl.releaseRemove(req, res));

    return router;
};
