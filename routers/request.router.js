const router = require('express').Router();
const multer = require('multer');
const mv = require('mv');
const path = require('path');
//const constants=require('../constants');
const uploads = require('../utils/uploads');
const handler = require('../utils/handler');
const status = require('http-status');
let UPLOAD_FILE = 'documents/';
let UPLOAD_FILE_TEMP = 'tmpFile/';

//Load File
// var storageFile = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, UPLOAD_FILE);
//     },
//     filename: function (req, file, cb) {                        
//         cb(null, UPLOAD_FILE_TEMP + req.params._id + path.extname(file.originalname));
//     }
// })

// let uploadFile = multer({ storage: storageFile }).single('file');

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
                        return requestCtrl.correctRequest(req,res);
                    }
                });
            } else {
                return requestCtrl.correctRequestWithoutFile(req,res);
            }

        });
    });

    router.get('/', (req, res) => requestCtrl.getAllRequest(req, res));
    router.get('/phase/:phase', (req,res)=>requestCtrl.getRequestByStatus(req, res));
    router.get('/approved', (req, res) => requestCtrl.getAllRequestApproved(req, res));
    router.put('/:_id/status', (req, res) => requestCtrl.updateRequest(req, res));
    router.put('/:_id/integrants', (req, res) => requestCtrl.addIntegrants(req, res));
    router.get('/:_id', (req, res) => requestCtrl.getById(req, res));
    return router;
}
