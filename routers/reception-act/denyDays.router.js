const router = require('express').Router();

module.exports = (wagner) => {
    const danyDaysCtrl = wagner.invoke((DenyDay) =>
        require('../../controllers/reception-act/denyDays.controller')(DenyDay));

    router.get('/', (req, res) =>
        danyDaysCtrl.getAll(req, res));

    router.post('/create', (req, res) =>
        danyDaysCtrl.create(req, res));
    return router;
};
