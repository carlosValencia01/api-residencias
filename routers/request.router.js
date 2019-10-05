const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const path = require('path');
const uploads = require('../utils/uploads');
const handler = require('../utils/handler');
const status = require('http-status');
const UPLOAD_FILE = 'documents/';
const UPLOAD_FILE_TEMP = 'tmpFile/';

module.exports = (wagner) => {
    const requestCtrl = wagner.invoke((Request) => require('../controllers/request.controller')(Request));
    router.post('/create/:_id',
        function (req, res) {
            uploads.uploadFile(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    console.log("Error Multer", err);
                    return handler.handleError(res, status.BAD_REQUEST, err);
                } else if (err) {
                    console.log("Error Upload", err);
                    return handler.handleError(res, status.BAD_REQUEST, err);
                }
                let sourceFile = UPLOAD_FILE + '/' + UPLOAD_FILE_TEMP + req.params._id + path.extname(req.file.originalname);
                let destFile = UPLOAD_FILE + req.body.Career + '/' + (req.body.ControlNumber + "-" + req.body.FullName) + '/' + req.body.Document + path.extname(req.file.originalname);
                mv(sourceFile, destFile, { mkdirp: true }, function (err) {
                    if (typeof err !== "undefined") {
                        return handler.handleError(res, status.BAD_REQUEST, err);
                    } else {
                        return requestCtrl.create(req, res)
                    }
                });
            })
        });


    router.put('/:_id', (req, res) => {
        uploads.uploadFile(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("Error Multer", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            } else if (err) {
                console.log("Error Upload", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            }
            console.log("File", req.file);
            if (typeof (req.file) !== 'undefined') {
                let sourceFile = UPLOAD_FILE + '/' + UPLOAD_FILE_TEMP + req.params._id + path.extname(req.file.originalname);
                let destFile = UPLOAD_FILE + req.body.Career + '/' + (req.body.ControlNumber + "-" + req.body.FullName) + '/' + req.body.Document + path.extname(req.file.originalname);
                mv(sourceFile, destFile, { mkdirp: true }, function (err) {
                    if (typeof err !== "undefined") {
                        return handler.handleError(res, status.BAD_REQUEST, err);
                    } else {
                        return requestCtrl.correctRequest(req, res);
                    }
                });
            } else {
                return requestCtrl.correctRequestWithoutFile(req, res);
            }

        });
    });

    router.get('/', (req, res) => requestCtrl.getAllRequest(req, res));
    router.get('/phase/:phase', (req, res) => requestCtrl.getRequestByStatus(req, res));
    router.get('/approved', (req, res) => requestCtrl.getAllRequestApproved(req, res));
    router.put('/:_id/status', (req, res) => requestCtrl.updateRequest(req, res));
    router.put('/:_id/integrants', (req, res) => requestCtrl.addIntegrants(req, res));
    router.put('/:_id/released', function (req, res) {
        uploads.uploadFile(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("Error Multer", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            } else if (err) {
                console.log("Error Upload", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            }
            console.log("request", req.file)
            let sourceFile = UPLOAD_FILE + '/' + UPLOAD_FILE_TEMP + req.params._id + path.extname(req.file.originalname);
            let destFile = UPLOAD_FILE + req.body.Career + '/' + (req.body.ControlNumber + "-" + req.body.FullName) + '/' + req.body.Document + path.extname(req.file.originalname);
            mv(sourceFile, destFile, { mkdirp: true }, function (err) {
                if (typeof err !== "undefined") {
                    return handler.handleError(res, status.BAD_REQUEST, err);
                } else {
                    return requestCtrl.releasedRequest(req, res);
                }
            });
        })
    });

    router.get('/:_id/file/:resource', (req, res) =>
        requestCtrl.getResource(req, res));

    router.put('/:_id/file', (req, res) =>
        requestCtrl.fileCheck(req, res));

    router.post('/:_id/file', function (req, res) {
        uploads.uploadFile(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("Error Multer", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            } else if (err) {
                console.log("Error Upload", err);
                return handler.handleError(res, status.BAD_REQUEST, err);
            }
            console.log("request", req.file)
            let sourceFile = UPLOAD_FILE + '/' + UPLOAD_FILE_TEMP + req.params._id + path.extname(req.file.originalname);
            let destFile = UPLOAD_FILE + req.body.Career + '/' + (req.body.ControlNumber + "-" + req.body.FullName) + '/' + req.body.Document + path.extname(req.file.originalname);
            mv(sourceFile, destFile, { mkdirp: true }, function (err) {
                if (typeof err !== "undefined") {
                    return handler.handleError(res, status.BAD_REQUEST, err);
                } else {
                    return requestCtrl.uploadFile(req, res)
                }
            });
        })
    });
    router.get('/:_id', (req, res) => requestCtrl.getById(req, res));
    return router;
};
