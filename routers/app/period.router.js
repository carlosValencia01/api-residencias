const router = require('express').Router();

module.exports = (wagner) => {
    const periodCtrl = wagner.invoke((Period) =>
        require('../../controllers/app/period.controller')(Period));

    router.get('/', (req, res) =>
        periodCtrl.getAll(req, res));
    router.get('/active', (req, res) =>
        periodCtrl.getActivePeriod(req, res));
    router.post('/create', (req, res) =>
        periodCtrl.createPeriod(req, res));
    router.put('/update/:id', (req, res) =>
        periodCtrl.updatePeriod(req, res));

    return router;
};
