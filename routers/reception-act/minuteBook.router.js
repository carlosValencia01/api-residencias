const router = require('express').Router();

module.exports = (wagner) => {
    const minuteBookCtrl = wagner.invoke((MinuteBook, TitleOption) =>
        require('../../controllers/reception-act/minuteBook.controller')(MinuteBook, TitleOption));

    router.get('/getAll', (req, res) =>
        minuteBookCtrl.getAllMinuteBooks(req, res));

    router.post('/create', (req, res) =>
        minuteBookCtrl.createMinuteBook(req, res));

    router.put('/changeStatus/:_id/status', (req, res) =>
        minuteBookCtrl.changeMinuteBookStatus(req, res));

    return router;
};
