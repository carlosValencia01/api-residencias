const router = require('express').Router();

module.exports = (wagner) => {
    const deptoCtrl = wagner.invoke((Department) =>
        require('../../controllers/app/department.controller')(Department));
        
        router.get('/employees', (req, res) => deptoCtrl.getAll(req, res));                

    return router;
};