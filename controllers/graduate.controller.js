const status = require('http-status');

let _request;
let _student;
let _employee;

const getRequestByControlNumber = (req, res) => {
    const {controlNumber} = req.params;
    const query = {"graduate.controlNumber": controlNumber};

    _request.findOne(query, (err, request) => {
        if (request) {
            return res.json(request);
        }
        res.json({
            status: status.INTERNAL_SERVER_ERROR,
            error: 'No existe solicitud para el egresado'
        });
    });
};

const newRequest = async (req, res) => {
    const request = req.body;
    const {controlNumber} = request.graduate;
    await _student.findOne({controlNumber: controlNumber}, (err, student) => {
        if (!err) {
            request.graduate.career = student.career;
        }
    });
    await _employee.findOne({position: 'JEFE DE DIVISIÓN DE ESTUDIOS PROFESIONALES'}, (err, employee) => {
        if (!err) {
            request.headProfessionalStudiesDivision = employee.name.fullName;
        }
    });
    await _employee.findOne({position: 'COORDINADOR DE TITULACIÓN'}, (err, employee) => {
        if (!err) {
            request.degreeCoordinator = employee.name.fullName;
        }
    });

    _request.create(request)
        .then(created =>
            res.json(created))
        .catch(err =>
            res.json({
                error: err.toString(),
                status: status.INTERNAL_SERVER_ERROR
            }));
};

const editRequest = (req, res) => {
    const {_id} = req.params;
    const requestData = req.body;

    _request.findOneAndUpdate({_id: _id}, requestData, (err, _) => {
        if (!err) {
            return res.json(req.body);
        }
        res.json({
            error: err.toString(),
            status: status.INTERNAL_SERVER_ERROR
        });
    });
};

const updateStatusRequest = (req, res) => {
    const {_id} = req.params;
    const {newStatus} = req.body;

    _request.findOneAndUpdate({_id: _id}, {$set: {status: newStatus}}, (err, _) => {
        if (!err) {
            return res.json({code: 200});
        }
        res.json({
            error: err.toString(),
            status: status.INTERNAL_SERVER_ERROR
        });
    })
};

module.exports = (Request, Student, Employee) => {
    _request = Request;
    _student = Student;
    _employee = Employee;
    return ({
        getRequestByControlNumber,
        newRequest,
        editRequest,
        updateStatusRequest,
    });
};
