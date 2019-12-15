const router = require('express').Router();

module.exports = (wagner) => {
    const careerController = wagner.invoke((Career) =>
        require('../../controllers/shared/career.controller')(Career));

    router.get('/career/:_id', (req, res) =>
        careerController.getOne(req, res));                

    router.get('/', (req, res) =>
        careerController.getAll(req, res));                

    router.post('/create', (req, res) =>
        careerController.createMultiple(req, res));                

    router.put('/update/:_id', (req, res) =>
        careerController.updateOne(req, res));  

    return router;
};