const router = require('express').Router();

module.exports = (wagner) => {
    const deptoCtrl = wagner.invoke((Department, Employee) =>
        require('../../controllers/app/department.controller')(Department, Employee));
        
        router.get('/employees', (req, res) => deptoCtrl.getAll(req, res));                

    return router;
};
