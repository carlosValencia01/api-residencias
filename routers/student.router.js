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

    router.get('/:id', function (req, res) {
        let imgId = req.params.id
        console.log('Obteniendo imagen con id: ' + imgId)
        studentCtrl.getOne(req, res, imgId)
    });

    router.get('/search/:search', (req, res) => 
        studentCtrl.search(req, res));

    router.post('/', upload.single('image'), function (req, res){
        console.log('Creando Student con image!');
        studentCtrl.create(req, res)
    })

    router.put('/', upload.single('image'), function (req, res) {
        studentCtrl.updateOne(req, res)
    })


    /*
    router.post('/', function (req, res) {
        console.log('creating pots');
        studentCtrl.create(req,res);
    });
    */
  
    return router;
}