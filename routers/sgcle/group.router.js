const router = require('express').Router();

module.exports = (wagner) => {

const groupCtrl = wagner.invoke((Group) =>
    require('../../controllers/sgcle/group.controller')(Group));

    router.post('/create', (req, res) =>
    groupCtrl.createGroup(req, res));

    router.get('/all', (req, res) =>
    groupCtrl.getAllGroup(req, res));

    router.get('/all/opened', (req, res) =>
    groupCtrl.getAllGroupOpened(req, res));

    return router;
}