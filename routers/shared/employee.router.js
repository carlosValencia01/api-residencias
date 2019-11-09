const router = require('express').Router();
const multer = require('multer');
let UPLOAD_PATH = 'images';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        console.log(req.params);
        cb(null, file.fieldname + '-' + req.params._id)
    }
});
let upload = multer({ storage: storage });

module.exports = (wagner) => {
    const employeeCtrl = wagner.invoke((Employee) =>
        require('../../controllers/shared/employee.controller')(Employee));

    router.get('/', (req, res) =>
        employeeCtrl.getAll(req, res));

    router.get('/area', (req, res) =>
        employeeCtrl.getEmployeeByArea(req, res));

    router.get('/:_id', (req, res) =>
        employeeCtrl.getById(req, res));

    router.get('/image/:_id', (req, res) =>
        employeeCtrl.getOne(req, res));

    router.get('/search/:search', (req, res) =>
        employeeCtrl.search(req, res));

    router.get('/searchrfc/:rfc', (req, res) =>
        employeeCtrl.searchRfc(req, res));

    router.post('/', upload.single('image'), (req, res) => {
        console.log('Creando Employee con image!');
        employeeCtrl.create(req, res)
    });

    router.post('/create', (req, res) =>
        employeeCtrl.createWithoutImage(req, res));

    router.post('/login', (req, res) =>
        employeeCtrl.getByControlNumber(req, res));

    router.put('/:_id', (req, res) =>
        employeeCtrl.updateEmployee(req, res));

    router.put('/image/:_id', upload.single('image'), (req, res) =>
        employeeCtrl.uploadImage(req, res));

    router.post('/csv', (req, res) =>
        employeeCtrl.csvDegree(req, res));

    router.get('/grade/search/:search', (req, res) =>
        employeeCtrl.searchGrade(req, res));

    router.put('/grade/:_id', (req, res) =>
        employeeCtrl.updateEmployeGrade(req, res));

    router.put('/positions/:_id', (req, res) =>
        employeeCtrl.updateEmployeePositions(req, res));

    router.put('/grades/:_id', (req, res) =>
        employeeCtrl.updateEmployeeGrades(req, res));

    router.put('/gradesPositions/:_id', (req, res) =>
        employeeCtrl.updateEmployeeGradesAndPositions(req, res));

    return router;
};
