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
    const employeeCtrl = wagner.invoke((Employee) =>
      require('../controllers/employee.controller')(Employee));

    router.get('/', (req, res) => employeeCtrl.getAll(req, res));

    router.get('/:_id', (req, res) => employeeCtrl.getById(req, res));
    
    router.get('/image/:_id',  (req, res) => 
    employeeCtrl.getOne(req, res));
    
    router.get('/search/:search', (req, res) => 
    employeeCtrl.search(req, res));
    
    router.post('/', upload.single('image'), function (req, res){
        console.log('Creando Employee con image!');
        employeeCtrl.create(req, res)
    });

    router.post('/create', function (req, res){
        employeeCtrl.createWithoutImage(req, res)
    });
    
    router.post('/login', (req, res) => employeeCtrl.getByControlNumber(req, res));

    router.put('/:_id', (req, res) => 
        employeeCtrl.updateEmployee(req, res));


    router.put('/image/:_id', upload.single('image'), function (req, res) {
        employeeCtrl.uploadImage(req, res)
    })


    /*
    router.post('/', function (req, res) {
        console.log('creating pots');
        employeeCtrl.create(req,res);
    });
    */
  
    return router;
}