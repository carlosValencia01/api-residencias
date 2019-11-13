const router = require('express').Router();
const multer = require('multer');
let UPLOAD_PATH = 'images';

var storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, cb) {
        console.log(req.params,'filenameeeee');
        cb(null, file.fieldname + '-' + req.params._id)
    }
});
let upload = multer({ storage: storage });

module.exports = (wagner) => {

    const studentCtrl = wagner.invoke((Student, Request, Role) =>
        require('../../controllers/shared/student.controller')(Student, Request, Role));


    router.get('/', (req, res) =>
        studentCtrl.getAll(req, res));

    router.get('/:_id', (req, res) =>
        studentCtrl.getById(req, res));

    router.get('/verifystatus/:nc', (req, res) =>
        studentCtrl.verifyStatus(req, res));

    router.get('/request/:_id', (req, res) =>
        studentCtrl.getRequest(req, res));

    router.get('/image/:_id', (req, res) =>
        studentCtrl.getOne(req, res));

    router.get('/search/:search', (req, res) =>
        studentCtrl.search(req, res));

    router.get('/document/:resource/:_id', (req, res) =>
        studentCtrl.getFilePDF(req, res));

    router.get('/:resource/:_id', (req, res) =>
        studentCtrl.getResource(req, res));
    
    router.get('/get/documents/drive/:_id', (req, res) =>
        studentCtrl.getDocumentsDrive(req, res));

    router.get('/get/folderid/:_id', (req, res) =>
        studentCtrl.getFolderId(req, res));
    router.get('/get/periodinscription/:_id', (req, res) =>
        studentCtrl.getPeriodInscription(req, res));

    router.get('/get/career/:_id', (req, res) =>
        studentCtrl.getCareerDetail(req, res));



    router.post('/', upload.single('image'), (req, res) => {
        console.log('Creando Student con image!');
        studentCtrl.create(req, res);
    });

    router.post('/create', (req, res) =>
        studentCtrl.createWithoutImage(req, res));

    router.post('/login', (req, res) =>
        studentCtrl.getByControlNumber(req, res));

    router.put('/:_id', (req, res) =>
        studentCtrl.updateStudent(req, res));

    router.put('/image/:_id', upload.single('image'), (req, res) =>
        studentCtrl.uploadImage(req, res));

    router.put('/document/:_id', (req, res) =>
        studentCtrl.assignDocument(req, res));

    router.put('/document/drive/:_id', (req, res) =>
        studentCtrl.assignDocumentDrive(req, res));

    router.put('/document/status/:_id', (req, res) =>
        studentCtrl.updateDocumentLog(req, res));

    router.post('/csv', (req, res) =>
        studentCtrl.csvIngles(req, res));

    return router;
};
