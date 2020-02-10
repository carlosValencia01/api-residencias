const router = require('express').Router();

module.exports = (wagner) => {
    const minuteBookCtrl = wagner.invoke((MinuteBook) =>
        require('../../controllers/reception-act/minuteBook.controller')(MinuteBook));

    router.get('/getAll', (req, res) =>
        minuteBookCtrl.getAllMinuteBooks(req, res));

    router.post('/create', (req, res) =>
        minuteBookCtrl.createMinuteBook(req, res));

    router.put('/changeStatus/:_id', (req, res) =>
        minuteBookCtrl.changeMinuteBookStatus(req, res));

    router.get('/getAllActive', (req, res) =>
        minuteBookCtrl.getAllActiveMinuteBooks(req, res));
        
    return router;
};
