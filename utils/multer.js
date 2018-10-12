const multer = require('multer');
let UPLOAD_PATH = 'images'

module.exports.storage = () => {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, UPLOAD_PATH)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now())
        }
    });

    return storage;
};

