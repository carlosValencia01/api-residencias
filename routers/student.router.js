const router = require('express').Router();
const multer = require('multer');

let UPLOAD_PATH = 'images'

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
let upload = multer({ storage: storage })


module.exports = (wagner) => {
    const studentCtrl = wagner.invoke((Student) =>
      require('../controllers/student.controller')(Student));

    router.get('/', (req, res) => studentCtrl.getAll(req, res));


    router.post('/', upload.single('image'), function (req, res, next){
        console.log('Creando Student con image!');
        studentCtrl.create(req, res)
    })


    /*
    router.post('/', function (req, res) {
        console.log('creating pots');
        studentCtrl.create(req,res);
    });
    */
  
    return router;
}