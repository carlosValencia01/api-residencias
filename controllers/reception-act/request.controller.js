const handler = require('../../utils/handler');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const { eRequest, eStatusRequest, eRole } = require('../../enumerators/reception-act/enums');

let _request;

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
            type: request.Document, dateRegister: new Date(), nameFile: request.Career + '/' + (request.ControlNumber + '-' + request.FullName) + '/' + request.Document + path.extname(req.file.originalname), status: 'Accept'
        });
    request.documents = tmpFile;
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
        .populate
        ({
            path: 'studentId', model: 'Student',
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
            _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado'] } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
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
                .populate
                ({
                    path: 'studentId', model: 'Student',
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
            _request.find({ phase: { $nin: ['Capturado', 'Enviado'] } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
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
};

const getAllRequestApproved = (req, res) => {
    _request.find(
        { status: { $eq: 'Aprobado' } }
    ).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1
        }
    }).exec(handler.handleMany.bind(null, 'request', res));
};

const getById = (req, res) => {
    const { _id } = req.params;
    _request.find({ _id: _id }).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1,
            controlNumber: 1,
            career: 1
        }
    }).exec(handler.handleOne.bind(null, 'request', res));
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
};

const correctRequest = (req, res) => {
    const { _id } = req.params;
    let request = req.body;
    request.lastModified = new Date();
    let tmpFile = [];
    tmpFile.push(
        {
            type: request.Document, dateRegister: new Date(), nameFile: request.Career + '/' + (request.ControlNumber + '-' + request.FullName) + '/' + request.Document + path.extname(req.file.originalname), status: 'Process'
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
            return handler.handleError(res, status.NOT_FOUND, { message: 'Solicitud no encontrada' });
        console.log('Data', data);
        request.integrants = data;
        console.log('REQUS', request);
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

const uploadFile = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } },
        (error, request) => {
            if (error) {
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
            }
            if (!request) {
                _request.update({ _id: _id }, {
                    $set: {
                        status: eStatusRequest.PROCESS
                    },
                    $addToSet: {
                        documents:
                        {
                            type: data.Document, dateRegister: new Date(), nameFile: data.Career + '/' + (data.ControlNumber + '-' + data.FullName) + '/' + data.Document + path.extname(req.file.originalname), status: 'Process'
                        }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            } else {
                _request.update({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
                    $set: {
                        'documents.$': { type: data.Document, dateRegister: new Date(), nameFile: data.Career + '/' + (data.ControlNumber + '-' + data.FullName) + '/' + data.Document + path.extname(req.file.originalname), status: 'Process' }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            }
        });
}

const getResource = (req, res) => {
    const { _id } = req.params;
    const { resource } = req.params;
    _request.findOne({ _id: _id }, (errorRequest, request) => {
        if (errorRequest)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Solicitud no encontrada' });
        if (!request.documents)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
        var fileInformation = request.documents.find(f => f.nameFile.includes(resource.toUpperCase()));
        if (!fileInformation)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
        res.set('Content-Type', 'application/pdf');
        fs.createReadStream(path.join('documents', fileInformation.nameFile)).pipe(res);
    });
};

const fileCheck = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.findOneAndUpdate({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
        $set: {
            'documents.$.status': data.Status,
            'documents.$.observation':data.Observation
        }
    }, { new: true }).exec(handler.handleOne.bind(null, 'request', res));
};

const releasedRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    console.log('Upload fgile', data);
    console.log('Upload fgile', _id);
    _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } },
        (error, request) => {
            if (error) {
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
            }

            if (!request) {
                _request.update({ _id: _id }, {
                    $set: {
                        phase: eRequest.RELEASED,
                        status: eStatusRequest.ACCEPT,
                        lastModified: new Date()
                    },
                    $addToSet: {
                        documents:
                        {
                            type: data.Document, dateRegister: new Date(), nameFile: data.Career + '/' + (data.ControlNumber + '-' + data.FullName) + '/' + data.Document + path.extname(req.file.originalname), status: 'Accept'
                        },
                        history: {
                            phase: eRequest.REGISTERED,
                            achievementDate: new Date(),
                            doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                            observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                            status: eStatusRequest.ACCEPT
                        }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            } else {
                _request.update({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
                    $set: {
                        'documents.$': { type: data.Document, dateRegister: new Date(), nameFile: data.Career + '/' + (data.ControlNumber + '-' + data.FullName) + '/' + data.Document + path.extname(req.file.originalname), status: 'Accept' },
                        phase: eRequest.DELIVERED,
                        status: eStatusRequest.NONE,
                        lastModified: new Date()
                    },
                    $addToSet: {
                        history: {
                            phase: eRequest.RELEASED,
                            achievementDate: new Date(),
                            doer: typeof (data.Doer) !== 'undefined' ? data.doer : '',
                            observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                            status: eStatusRequest.ACCEPT
                        }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            }
        }
    );
};

const updateRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    console.log('data send', data);
    _request.findOne({ _id: _id }).exec((error, request) => {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        if (!request)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Solicitud no encontrada' });
        let item = {
            phase: request.phase,
            achievementDate: new Date(),
            doer: typeof (data.doer) !== 'undefined' ? data.doer : '',
            observation: typeof (data.observation) !== 'undefined' ? data.observation : ''
        };
        if (typeof (request.history) === 'undefined')
            request.history = [];
        switch (request.phase) {
            case eRequest.CAPTURED: {
                if (data.operation !== eStatusRequest.REJECT) {
                    request.phase = eRequest.SENT;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.ACCEPT
                }
                else {
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
                } else {
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
                if (data.operation === eStatusRequest.REJECT) {
                    request.phase = eRequest.VERIFIED;
                    request.status = eStatusRequest.REJECT;
                    item.status = eStatusRequest.REJECT;
                }
                else {
                    request.phase = eRequest.DELIVERED;
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT
                }
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
        request.history.push(item);
        request.doer = data.doer;
        request.observation = data.observation;
        request.lastModified = new Date();
        console.log('OKO', request);
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
};

module.exports = (Request) => {
    _request = Request;
    return ({
        create,
        getById,
        getAllRequest,
        getAllRequestApproved,
        updateRequest,
        correctRequestWithoutFile,
        correctRequest,
        addIntegrants,
        releasedRequest,
        getRequestByStatus,
        uploadFile,
        getResource,
        fileCheck,
    });
};
