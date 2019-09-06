const router = require('express').Router();

module.exports = (wagner) => {
    const englishCtrl = wagner.invoke((Student) =>
        require('../controllers/english.controller')(Student));

        router.get('/search/:search', (req, res) => englishCtrl.search(req, res));                

        router.get('/', (req, res) => englishCtrl.getAll(req, res));                

        router.post('/create', (req, res) => englishCtrl.create(req, res));                

        router.delete('/remove/:_id', (req, res) => englishCtrl.remove(req, res));                

    return router;
}