const router = require('express').Router();

module.exports = (wagner) => {
    const minutBookCtrl = wagner.invoke((MinuteBook, TitleOption) =>
        require('../../controllers/reception-act/minuteBook.controller')(MinuteBook, TitleOption));

    router.get('/getAll', (req, res) =>
        englishCtrl.getAllMinuteBooks(req, res));

    router.post('/create', (req, res) =>
        minutBookCtrl.createMinuteBook(req, res));

    router.put('/changeStatus/:_id/status', (req, res) =>
        minutBookCtrl.changeMinuteBookStatus(req, res));

    return router;
};
