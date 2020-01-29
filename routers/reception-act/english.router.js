const router = require('express').Router();

module.exports = (wagner) => {
    const englishCtrl = wagner.invoke((Student) =>
        require('../../controllers/reception-act/english.controller')(Student));

    router.get('/search/:search', (req, res) =>
        englishCtrl.search(req, res));

    router.get('/released', (req, res) =>
        englishCtrl.getAllReleased(req, res));

    router.get('/notReleased', (req, res) =>
        englishCtrl.getAllNotReleased(req, res));

    router.post('/create', (req, res) =>
        englishCtrl.create(req, res));

    router.put('/release/:_controlNumber', (req, res) =>
        englishCtrl.releaseStudent(req, res));

    router.delete('/removeRelease/:_controlNumber', (req, res) =>
        englishCtrl.releaseRemove(req, res));

    return router;
};
