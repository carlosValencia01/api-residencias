const router = require('express').Router();

module.exports = (wagner) => {
    const imssCtrl = wagner.invoke((Student, IMSS) =>
        require('../../controllers/shared/imss.controller')(Student, IMSS));

    router.get('/search/:search', (req, res) =>
        imssCtrl.search(req, res));

    router.get('/insured', (req, res) =>
        imssCtrl.getAllInsured(req, res));

    router.get('/uninsured', (req, res) =>
        imssCtrl.getAllUninsured(req, res));

    router.post('/convert/csv', (req, res) =>
        imssCtrl.convertCSV(req, res));

    router.put('/insured/csv', (req, res) =>
        imssCtrl.insuredCsv(req, res));

    router.put('/insured/:_controlNumber', (req, res) =>
        imssCtrl.insuredStudent(req, res));

    router.put('/regularize/nss', (req, res) =>
        imssCtrl.regularizeNSS(req, res));

    router.delete('/uninsured/:_controlNumber', (req, res) =>
        imssCtrl.uninsuredStudent(req, res));

    return router;
};
