const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const path = require('path');
const uploads = require('../../utils/uploads');
const handler = require('../../utils/handler');
const status = require('http-status');
const UPLOAD_FILE = 'documents/';
const UPLOAD_FILE_TEMP = 'tmpFile/';

module.exports = (wagner) => {
    const requestCtrl = wagner.invoke((Request, Range, Folder, Student,Period,Department, Employee, Position) =>
        require('../../controllers/reception-act/request.controller')(Request, Range, Folder, Student,Period,Department, Employee, Position));

    router.post('/create/:_id', (req, res) => {
        return requestCtrl.create(req, res);
    });
    router.post('/titled', (req, res) => {
        return requestCtrl.createTitled(req, res);
    });

    router.put('/:_id', (req, res) => {
        return requestCtrl.correctRequest(req, res);
    });

    router.get('/', (req, res) =>
        requestCtrl.getAllRequest(req, res));

    router.post('/settitled', (req, res) =>
        requestCtrl.completeTitledRequest(req, res));

    router.get('/periods', (req, res) =>
        requestCtrl.getPeriods(req, res));

    router.get('/phase/:phase', (req, res) =>
        requestCtrl.getRequestByStatus(req, res));

    router.get('/students', (req, res) =>
        requestCtrl.StudentsToSchedule(req, res));

    router.post('/schedule', (req, res) =>
        requestCtrl.groupRequest(req, res));

    router.post('/diary', (req, res) =>
        requestCtrl.groupDiary(req, res));

    router.get('/approved', (req, res) =>
        requestCtrl.getAllRequestApproved(req, res));

    router.put('/:_id/status', (req, res) =>
        requestCtrl.updateRequest(req, res));

    router.put('/:_id/integrants', (req, res) =>
        requestCtrl.addIntegrants(req, res));

    router.put('/:_id/released', (req, res) => {
        return requestCtrl.releasedRequest(req, res);
    });

    router.put('/:_id/jury', (req, res) => {
        return requestCtrl.changeJury(req, res);
    });

    router.get('/:_id/file/:resource', (req, res) =>
        requestCtrl.getResource(req, res));

    router.get('/:_id/weblink/:resource', (req, res) =>
        requestCtrl.getResourceLink(req, res));

    router.put('/:_id/file', (req, res) =>
        requestCtrl.fileCheck(req, res));

    router.post('/:_id/file', (req, res) => {
        requestCtrl.uploadFile(req, res);
    });
    router.post('/period', (req, res) => {
        requestCtrl.period(req, res);
    });

    router.post('/:_id/file/omit', (req, res) =>
        requestCtrl.omitFile(req, res));

    router.get('/:_id', (req, res) =>
        requestCtrl.getById(req, res));

    router.get('/verify/:_requestId/:_code', (req, res) =>
        requestCtrl.verifyCode(req, res));

    router.get('/sendCode/:_requestId', (req, res) =>
        requestCtrl.sendVerificationCode(req, res));

    router.delete('/:id', (req, res) =>
        requestCtrl.removeTitled(req, res));

    return router;
};
