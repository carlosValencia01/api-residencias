const multer = require('multer');
const constants=require('../constants');
const path = require('path');
//Se ocupa el identificador del usuario
const uploadFileConfiguration = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, constants.FILE_DIRECTORY)
    },
    filename: function (req, file, cb) {
        cb(null, constants.FILE_DIRECTORY_TEMP + req.params._id + path.extname(file.originalname));
    }
});

var uploadFile = multer({ storage: uploadFileConfiguration }).single('file');
module.exports.uploadFile=uploadFile;
