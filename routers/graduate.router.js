const router = require('express').Router();

module.exports = (wagner) => {
    const graduateCtrl = wagner.invoke((Request, Student, Employee) =>
        require('../controllers/graduate.controller')(Request, Student, Employee));

    router.get('/request/:controlNumber', (req, res) =>
        graduateCtrl.getRequestByControlNumber(req, res));

    router.post('/request', (req, res) =>
        graduateCtrl.newRequest(req, res));

    router.put('/request/:_id', (req, res) =>
        graduateCtrl.editRequest(req, res));

    router.put('/request/status/:_id', (req, res) =>
        graduateCtrl.updateStatusRequest(req, res));

    return router;
}
