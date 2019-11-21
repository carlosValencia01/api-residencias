const router = require('express').Router();

module.exports = (wagner) => {
    const rangeCtrl = wagner.invoke((Range) =>
        require('../../controllers/reception-act/range.controller')(Range));

    router.get('/', (req, res) =>
        rangeCtrl.getAll(req, res));

    router.post('/create', (req, res) =>
        rangeCtrl.create(req, res));

    router.delete('/remove/:_id', (req, res) =>
        rangeCtrl.remove(req, res));

    router.put('/:_id', (req, res) =>
        rangeCtrl.update(req, res));
    return router;
};
