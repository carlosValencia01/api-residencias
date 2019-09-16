const handler = require('../utils/handler');
const status = require('http-status');
const path = require('path');
const eStatusRequest = require('../enumerators/eStatusRequest');
const eRequest = require('../enumerators/eRequest');
const eRole = require('../enumerators/eRole');
let _request;
//let _student;

const create = (req, res) => {
    let request = req.body;
    request.lastModified = new Date();
    request.applicationDate = new Date();
    request.studentId = req.params._id;
    //Add 08/08/2019
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    //Add
    request.department = { name: request.department, boss: request.boss };
    let tmpFile = [];
    tmpFile.push(
        {
            type: request.Document, dateRegister: new Date(), nameFile: request.Career + '/' + (request.ControlNumber + "-" + request.FullName) + '/' + request.Document + path.extname(req.file.originalname), status: "wait"
        });
    request.documents = tmpFile;
    // student:this.cookiesService.ge   tData().user._id,
    //   projectName:this.frmRequest.get('name').value,
    //   email:this.frmRequest.get('email').value,
    //   proposedDate: this.frmRequest.get('date').value,
    //   applicationDate: new Date(),
    //   status:"Solicitado",
    //   telephone: this.frmRequest.get('telephone').value,
    //   honorificMention:this.frmRequest.get('honorific').value,
    //   lastModified: new Date(),    
    _request.create(request).then(created => {

        res.json({ request: created });
    }).catch(err => {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    })
};

const getAllRequest = (req, res) => {
    _request.find({ status: { $ne: 'Aprobado' } })
        .select({
            history: 0,
        })
        .populate
        ({
            path: 'studentId', model: "Student",
            select: {
                fullName: 1,
                controlNumber: 1,
                career: 1
            }
        })
        .exec(handler.handleMany.bind(null, 'request', res));
};

const getRequestByStatus = (req, res) => {
    const { phase } = req.params;    
    switch (phase) {
        case eRole.eSECRETARY: {            
            _request.find({ phase: { $nin: ['Capturado','Enviado','Verificado'] } })
                .select({
                    history: 0,
                })
                .populate
                ({
                    path: 'studentId', model: "Student",
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1
                    }
                })
                .exec(handler.handleMany.bind(null, 'request', res));
                break;
        }
        case eRole.eCOORDINATION: {
            _request.find({ phase: { $ne: 'Capturado' } })
            .select({
                history: 0,
            })
            .populate
            ({
                path: 'studentId', model: "Student",
                select: {
                    fullName: 1,
                    controlNumber: 1,
                    career: 1
                }
            })
            .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        case eRole.eCHIEFACADEMIC: {
            _request.find({ phase: { $nin: ['Capturado','Enviado'] } })
            .select({
                history: 0,
            })
            .populate
            ({
                path: 'studentId', model: "Student",
                select: {
                    fullName: 1,
                    controlNumber: 1,
                    career: 1
                }
            })
            .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        default: {
            return getAllRequest(req, res);
        }
    }
}
const getAllRequestApproved = (req, res) => {
    _request.find(
        { status: { $eq: 'Aprobado' } }
    ).populate({
        path: 'studentId', model: "Student",
        select: {
            fullName: 1
        }
    }).exec(handler.handleMany.bind(null, 'request', res));
};

const getById = (req, res) => {
    const { _id } = req.params;
    _request.find({ _id: _id }).populate({
        path: 'studentId', model: "Student",
        select: {
            fullName: 1
        }
    }).exec(handler.handleOne.bind(null, 'request', res));
    // .exec((error, request) => {
    //     if (error) {
    //         return handler.handleError(res, status.INTERNAL_SERVER_ERROR, err);            
    //     }
    //     if (!request) {
    //         return handler.handleError(res, status.NOT_FOUND, {message: "Solicitud no encontrada"});   
    //     }
    //     console.log("reques", request);
    //     return res.json({status:"OK"})         ;
    // })
};

const correctRequestWithoutFile = (req, res) => {
    const { _id } = req.params;
    let request = req.body;
    //Modificar
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    request.lastModified = new Date();
    request.observation = '';  //Observaciones    
    _request.findOneAndUpdate({ studentId: _id }, request).then(update => {
        res.json({ request: update });
    }).catch(err => {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        });
    })
}

const correctRequest = (req, res) => {
    const { _id } = req.params;
    let request = req.body;
    request.lastModified = new Date();
    let tmpFile = [];
    tmpFile.push(
        {
            type: request.Document, dateRegister: new Date(), nameFile: request.Career + '/' + (request.ControlNumber + "-" + request.FullName) + '/' + request.Document + path.extname(req.file.originalname), status: "wait"
        });
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    request.documents = tmpFile;
    request.observation = '';  //Observaciones    
    _request.findOneAndUpdate({ studentId: _id }, request).then(update => {
        res.json({ request: update });
    }).catch(err => {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    })
};


const addIntegrants = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.findOne({ _id: _id }).exec((error, request) => {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        if (!request)
            return handler.handleError(res, status.NOT_FOUND, { message: "Solicitud no encontrada" });
        console.log("Data", data);
        request.integrants = data;
        console.log("REQUS", request);
        request.save((errorReq, response) => {
            if (errorReq) {
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, errorReq);
            }
            var json = {};
            json['request'] = response;
            return res.status(status.OK).json(json);
        });
    });
}
const updateRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    // if (data.operation === eStatusRequest.REJECT) {
    //     let update = { $set: { lastModified: new Date(), status: 'Reject', 
    //     observation: data.observation,
    //     doer: data.doer } };
    //     _request.findOneAndUpdate({ _id: _id }, update, { new: true }).exec(handler.handleOne.bind(null, 'request', res));
    //} else {
    _request.findOne({ _id: _id }).exec((error, request) => {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        if (!request)
            return handler.handleError(res, status.NOT_FOUND, { message: "Solicitud no encontrada" });
        let item = {
            phase: request.phase,
            achievementDate: new Date(),
            doer: typeof (data.doer) !== 'undefined' ? data.doer : '',
            observation: typeof (data.observation) !== 'undefined' ? data.observation : ''
        };
        if (typeof (request.history) === 'undefined')
            request.history = [];

        // if (data.operation === eStatusRequest.REJECT) {
        //     request.status = eStatusRequest.REJECT;
        //     item.status = eStatusRequest.REJECT;
        //} else {
        //request.status = eStatusRequest.NONE;
        //item.status = eStatusRequest.ACCEPT;
        console.log("DATA",data);
        switch (request.phase) {
            case eRequest.CAPTURED: {
                if (data.operation !== eStatusRequest.REJECT) {
                    request.phase = eRequest.SENT;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.ACCEPT                    
                }
                else{
                    request.phase = eRequest.NONE;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.REJECT
                }
                break;
            }
            case eRequest.SENT: {
                if (data.operation !== eStatusRequest.REJECT) {
                    request.phase = eRequest.VERIFIED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.ACCEPT                    
                }else{
                    request.phase = eRequest.CAPTURED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.REJECT
                }
                break;
            }
            case eRequest.VERIFIED: {
                if (data.operation === eStatusRequest.REJECT) {
                    request.phase = eRequest.REQUEST;
                    request.status = eStatusRequest.REJECT;
                    item.status = eStatusRequest.REJECT;
                }
                else {
                    request.phase = eRequest.REGISTERED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.ACCEPT
                }
                break;
            }
            case eRequest.REGISTERED: {
                if (data.operation === eStatusRequest.REJECT) {
                    request.phase = eRequest.VERIFIED;
                    request.status = eStatusRequest.REJECT;
                    item.status = eStatusRequest.REJECT;
                }
                else {
                    request.phase = eRequest.RELEASED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.ACCEPT
                }
                break;
            }
            case eRequest.RELEASED: {
                break;
            }
            case eRequest.VALIDATED: {
                break;
            }
            case eRequest.SCHEDULED: {
                break;
            }
            case eRequest.REALIZED: {
                break;
            }
            case eRequest.APPROVED: {
                break;
            }
        }
        //}
        request.history.push(item);
        request.doer = data.doer;
        request.observation = data.observation;
        request.lastModified = new Date();
        console.log("OKO", request);
        request.save((errorReq, response) => {
            if (errorReq) {
                console.log(errorReq);
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, errorReq);
            }
            var json = {};
            json['request'] = response;
            return res.status(status.OK).json(json);
        });
    });
    //}

};






module.exports = (Request) => {
    _request = Request;
    // _student=Student;
    return ({
        create,
        getById,
        getAllRequest,
        getAllRequestApproved,
        updateRequest,
        correctRequestWithoutFile,
        correctRequest,
        addIntegrants,
        getRequestByStatus
    });
}