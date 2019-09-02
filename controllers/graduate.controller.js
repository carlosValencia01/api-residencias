const status = require('http-status');

const generatePDFReport = require('../utils/generateReport');
const registerTemplate = require('../reports/registerTemplate')();
const requestTemplate = require('../reports/requestTemplate')();

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
            req.body._id = _._id;
            return res.json(req.body);
        }
        res.json({
            error: err.toString(),
            status: status.INTERNAL_SERVER_ERROR
        });
    });
};

const updateStatusRequest = async (req, res) => {
    const {_id} = req.params;
    const {newStatus, observation} = req.body;

   await  _request.findOneAndUpdate({_id: _id}, {$set: {status: newStatus}}, async (err, _) => {
        if (!err) {
            let errors = false;
            if (newStatus === 'ENVIADO') {
                await _request.findOneAndUpdate({_id: _id}, {$set: {editionDate: new Date()}},  (err, _) => {
                    if (err) {
                        errors = true;
                    }
                });
            }
            if (observation) {
                await _request.findOneAndUpdate({_id: _id}, {observations: observation}, (err, _) => {
                    if (err) {
                        errors = true;
                    }
                });
            }
            if (!errors) {
                return await res.json({code: 200});
            } else {
                await res.json({
                    error: err.toString(),
                    status: status.INTERNAL_SERVER_ERROR
                });
            }
        }
        await res.json({
            error: err.toString(),
            status: status.INTERNAL_SERVER_ERROR
        });
    });
};

const generateRequest = (req, res) => {
    const {_id} = req.params;
    const filename = 'Solicitud de acto protocolario.pdf';

    _request.findOne({_id: _id}, (err, request) => {
        if (!err) {
            return generatePDFReport({
                content: requestTemplate.body(request._doc),
                header: requestTemplate.header(),
                footer: requestTemplate.footer(),
                config: {
                    format: 'letter',
                    orientation: 'portrait',
                    margin: {'top': '0mm', 'left': '25mm', 'right': '20mm', 'bottom': '10mm'},
                    headerHeight: '3cm',
                    footerHeight: '2cm'
                }
            }).then(out => {
                res.writeHead(200, {
                    'Content-type': 'application/pdf',
                    'Content-disposition': 'inline; filename=' + filename,
                    'Access-Control-Allow-Origin': '*'
                });
                out.stream.pipe(res);
            });
        }
        res.json({
            status: status.BAD_REQUEST,
            error: err.toString()
        });
    });
};

const generateRegister = (req, res) => {
    const {_id} = req.params;
    const filename = 'Registro de proyecto.pdf';

    _request.findOne({_id: _id}, (err, request) => {
        if (!err) {
            return generatePDFReport({
                content: registerTemplate.body(request._doc),
                header: registerTemplate.header(),
                footer: registerTemplate.footer(),
                config: {
                    format: 'letter',
                    orientation: 'portrait',
                    margin: {'top': '0mm', 'left': '25mm', 'right': '20mm', 'bottom': '10mm'},
                    headerHeight: '3cm',
                    footerHeight: '2cm'
                }
            }).then(out => {
                res.writeHead(200, {
                    'Content-type': 'application/pdf',
                    'Content-disposition': 'inline; filename=' + filename,
                    'Access-Control-Allow-Origin': '*'
                });
                out.stream.pipe(res);
            });
        }
        res.json({
            status: status.BAD_REQUEST,
            error: err.toString()
        });
    });
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
        generateRequest,
        generateRegister
    });
};
