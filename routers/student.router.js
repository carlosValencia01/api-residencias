const router = require('express').Router();
const multer = require('multer');

let UPLOAD_PATH = 'images'

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        console.log(req.params);
        cb(null, file.fieldname + '-' +req.params._id)
    }
})
let upload = multer({ storage: storage })



module.exports = (wagner) => {
    const studentCtrl = wagner.invoke((Student) =>
      require('../controllers/student.controller')(Student));

    router.get('/', (req, res) => studentCtrl.getAll(req, res));
    router.get('/:_id', (req, res) => studentCtrl.getById(req, res));
    
    
    router.get('/image/:_id',  (req, res) => 
    studentCtrl.getOne(req, res));
    
    router.get('/search/:search', (req, res) => 
    studentCtrl.search(req, res));
    
    router.post('/', upload.single('image'), function (req, res){
        console.log('Creando Student con image!');
        studentCtrl.create(req, res)
    });
    
    router.post('/login', (req, res) => studentCtrl.getByControlNumber(req, res));

    router.put('/:_id', (req, res) => 
        studentCtrl.updateStudent(req, res));


    router.put('/image/:_id', upload.single('image'), function (req, res) {
        studentCtrl.uploadImage(req, res)
    })


    /*
    router.post('/', function (req, res) {
        console.log('creating pots');
        studentCtrl.create(req,res);
    });
    */
  
    return router;
}