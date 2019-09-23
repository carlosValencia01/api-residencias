const router = require('express').Router();

module.exports = (wagner) => {
    const englishCtrl = wagner.invoke((English) =>
        require('../controllers/english.controller')(English));

    router.get('/validate/:controlNumber', (req, res) =>
        englishCtrl.validateControlNumber(req, res));

    router.post('/loadData', (req, res) =>
        englishCtrl.loadData(req, res));
    router.get('/search/:search', (req, res) => englishCtrl.search(req, res));                

    router.get('/', (req, res) => englishCtrl.getAll(req, res));                

    router.post('/create', (req, res) => englishCtrl.create(req, res));                

    router.delete('/remove/:_id', (req, res) => englishCtrl.remove(req, res));  

    return router;
};
