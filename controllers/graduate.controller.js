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

const requestTemplate = require('../reports/requestTemplate');

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
                    content: requestTemplate(request._doc),
                    engine: 'jsrender',
                    recipe: 'phantom-pdf',
                    phantom: {
                        customPhantomJS: true,
                        format: "letter",
                        orientation: "portrait",
                        margin: {"top": "1mm", "left": "25mm", "right": "20mm", "bottom": "10mm"},
                        headerHeight: "2cm",
                        header: `
                            <table style="width:100%;display:inline-flex;justify-content:center;font-size:8px;color:darkgray;">
                                <tr>
                                    <td align="left" height="70">
                                        <div align="left">
                                            <img alt="Secretaría de Educación Pública" width="150" src="/assets/images/logosep.png">
                                        </div>
                                    </td>
                                    <td align="right" height="70">
                                        <div align="right">
                                            <img alt="Tecnológico Nacional de México" width="150"  src="/assets/images/logotecnm.png"><br>
                                            <span style="font-weight:bold;font-size:10px;">Instituto Tecnológico de Tepic</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>`,
                        footerHeight: "2cm",
                        footer: `
                            <table style="width:100%;display:inline-flex;justify-content:center;font-size:8px;color:gray;">
                                <tr>
                                    <td>
                                        <div align="left">
                                            <img alt="ITT" height="30" src="/assets/images/logotec.png">
                                        </div>
                                    </td>
                                    <td>
                                        <div style="margin:0px 10px;" align="center">
                                            <span>Av. Tecnológico # 2595, Col. Lagos del Country. C.P. 63175</span><br>
                                            <span>Tepic, Nayarit, México. Tel: (311) 211 94 00 y 2 11 94 01. info@ittepic.edu.mx</span><br>
                                            <b>https://www.tecnm.mx/</b> | <b>http://www.tepic.tecnm.mx/</b>
                                        </div>
                                    </td>
                                    <td>
                                        <div align="right">
                                            <img alt="ITT" height="30" src="/assets/images/logotec.png">
                                        </div>
                                    </td>
                                </tr>
                            </table>`
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
