const status = require('http-status');
const jsreport = require('jsreport-core')({});
jsreport.use(require('jsreport-assets')({
    extensions: {
        assets: {
            allowedFiles: "**/*.*",
            searchOnDiskIfNotFoundInStore: true,
            rootUrlForLinks: "http://localhost:3003",
            publicAccessEnabled: true,
        }
    }
}));
jsreport.use(require('jsreport-phantom-pdf')());
jsreport.use(require('jsreport-jsrender')());
jsreport.init();

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

const generateRequest = (req, res) => {
    const {_id} = req.params;
    const filename = 'solicitud de acto protocolario.pdf';

    _request.findOne({_id: _id}, (err, request) => {
        if (!err) {
            return jsreport.render({
                template: {
                    content: requestTemplate.body(request._doc),
                    engine: 'jsrender',
                    recipe: 'phantom-pdf',
                    phantom: {
                        customPhantomJS: true,
                        format: "letter",
                        orientation: "portrait",
                        margin: {"top": "0mm", "left": "25mm", "right": "20mm", "bottom": "10mm"},
                        headerHeight: "3cm",
                        header: requestTemplate.header(),
                        footerHeight: "2cm",
                        footer: requestTemplate.footer()
                    }
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
    });
};
