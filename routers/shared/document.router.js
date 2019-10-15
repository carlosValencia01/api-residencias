const router = require('express').Router();

module.exports = (wagner) => {
    const documentCtrl = wagner.invoke((Document, Position) =>
        require('../../controllers/shared/document.controller')(Document, Position));

    router.get('/all', (req, res) =>
        documentCtrl.getAllDocuments(req, res));

    router.post('/create', (req, res) =>
        documentCtrl.createDocument(req, res));

    router.put('/update/:_id', (req, res) =>
        documentCtrl.updateDocument(req, res));

    router.delete('/remove/:_id', (req, res) =>
        documentCtrl.removeDocument(req, res));

    return router;
}