const handler = require('../../utils/handler');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const { eRequest, eStatusRequest, eRole, eFile, eOperation } = require('../../enumerators/reception-act/enums');
let _Drive;
let _request;
let _ranges;
const create = async (req, res) => {
    let request = req.body;
    request.lastModified = new Date();
    request.applicationDate = new Date();
    request.studentId = req.params._id;
    //Add 08/08/2019
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    //Add
    request.department = { name: request.department, boss: request.boss };
    let result = await _Drive.uploadFile(req, eOperation.NEW);
    if (typeof (result) !== 'undefined' && result.isCorrect) {
        let tmpFile = [];
        tmpFile.push(
            {
                // type: request.Document, dateRegister: new Date(), nameFile: request.Career + '/' + (request.ControlNumber + '-' + request.FullName) + '/' + request.Document + path.extname(req.file.originalname), status: 'Accept'            
                type: request.Document, dateRegister: new Date(), nameFile: eFile.PROYECTO, status: 'Accept', driveId: result.fileId
            });
        request.documents = tmpFile;
        _request.create(request).then(created => {
            res.json({ request: created });
        }).catch(err => {
            res.status(status.INTERNAL_SERVER_ERROR).json({
                error: err.toString()
            })
        })
    }
    else {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: 'Error al subir el archivo'
        });
    }

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
        case eRole.eHEADSCHOOLSERVICE: {
            _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado'] } })
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
        case eRole.eSTUDENTSERVICES: {
            _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado'] } })
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

const correctRequest = async (req, res) => {
    const { _id } = req.params;
    let request = req.body;
    request.lastModified = new Date();
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    request.observation = '';
    let result = { isCorrect: true };//Valor por defecto
    if (typeof (req.files) !== 'undefined' && req.files !== null)
        result = await _Drive.uploadFile(req, eOperation.EDIT);
    if (typeof (result) !== 'undefined' && result.isCorrect) {
        _request.findOneAndUpdate({ studentId: _id }, request).then(update => {
            res.json({ request: update });
        }).catch(err => {
            res.status(status.INTERNAL_SERVER_ERROR).json({
                error: err.toString()
            })
        })
    }
    else {
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: 'Archivo no cargado'
        })
    }


};

const addIntegrants = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.findOne({ _id: _id }).exec((error, request) => {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        if (!request)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Solicitud no encontrada' });
        // console.log('Data', data);
        request.integrants = data;
        // console.log('REQUS', request);
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

const omitFile = (req, res) => {
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
                            type: data.Document, dateRegister: new Date(), nameFile: '', status: data.Status
                        }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            } else {
                _request.update({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
                    $set: {
                        "documents.$": { type: data.Document, dateRegister: new Date(), nameFile: '', status: data.Status }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            }
        });
}

// const uploadFile = (req, res) => {
//     const { _id } = req.params;
//     let data = req.body;
//     const files = req.files;
//     _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } },
//         async (error, request) => {
//             if (error) {
//                 return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
//             }
//             const docName = data.Document + path.extname(files.file.name);
//             if (!request) {
//                 let result = await _Drive.uploadFile(req, eOperation.NEW);
//                 if (typeof (result) !== 'undefined' && result.isCorrect) {
//                     _request.update({ _id: _id }, {
//                         $set: {
//                             status: eStatusRequest.PROCESS
//                         },
//                         $addToSet: {
//                             documents:
//                             {
//                                 type: data.Document, dateRegister: new Date(), nameFile: docName,
//                                 status: (data.IsEdit === 'true' ? 'Accept' : 'Process'),
//                                 driveId: result.fileId
//                             }
//                         }
//                     }).exec(handler.handleOne.bind(null, 'request', res));
//                 }

//             } else {
//                 const tmpDocument = request.documents.filter(doc => doc.type === data.Document);
//                 req.body.fileId = tmpDocument[0].driveId;
//                 let result = await _Drive.uploadFile(req, eOperation.EDIT);
//                 if (typeof (result) !== 'undefined' && result.isCorrect) {
//                     _request.update({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
//                         $set: {
//                             'documents.$': {
//                                 type: data.Document, dateRegister: new Date(), nameFile: docName,
//                                 driveId: tmpDocument[0].driveId,
//                                 status: (data.IsEdit === 'true' ? 'Accept' : 'Process')
//                             }
//                         }
//                     }).exec(handler.handleOne.bind(null, 'request', res));
//                 }
//             }
//         });
// }

const uploadFile = (req, res) => {
    const { _id } = req.params;
    const data = req.body;
    const files = req.files;
    _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } },
        async (error, request) => {
            if (error) {
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
            }
            const docName = data.Document + path.extname(files.file.name);
            if (!request) {
                let result = await _Drive.uploadFile(req, eOperation.NEW);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    _request.update({ _id: _id }, {
                        $set: {
                            status: eStatusRequest.PROCESS
                        },
                        $addToSet: {
                            documents:
                            {
                                type: data.Document, dateRegister: new Date(), nameFile: docName,
                                status: (data.IsEdit === 'true' ? 'Accept' : 'Process'),
                                driveId: result.fileId
                            }
                        }
                    }).exec(handler.handleOne.bind(null, 'request', res));
                }
            } else {
                const tmpDocument = request.documents.filter(doc => doc.type === data.Document);
                req.body.fileId = tmpDocument[0].driveId;
                let result = await _Drive.uploadFile(req, eOperation.EDIT);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    _request.update({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
                        $set: {
                            'documents.$': {
                                type: data.Document, dateRegister: new Date(), nameFile: docName,
                                driveId: tmpDocument[0].driveId,
                                status: (data.IsEdit === 'true' ? 'Accept' : 'Process')
                            }
                        }
                    }).exec(handler.handleOne.bind(null, 'request', res));
                }
            }
        });
}

const getResource = (req, res) => {
    const { _id } = req.params;
    const { resource } = req.params;
    _request.findOne({ _id: _id }, async (errorRequest, request) => {
        if (errorRequest)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Solicitud no encontrada' });
        if (!request.documents)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
        var fileInformation = request.documents.find(f => f.nameFile.includes(resource.toUpperCase()));
        if (!fileInformation)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });

        const tmpName = resource.toUpperCase() + "_" + _id + ".pdf";
        let result = await _Drive.downloadToLocal(fileInformation.driveId, tmpName);

        if (typeof (result) !== 'undefined' && result) {
            const fullPath = path.join(__dirname, '\\..\\..', 'documents', 'tmpFile', tmpName);
            res.set('Content-Type', 'application/pdf');
            fs.createReadStream(fullPath).pipe(res);
        }
        else {
            return res.status(status.BAD_REQUEST).json({ message: 'Documento no encontrado' });
        }
    });
};

const fileCheck = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.findOneAndUpdate({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
        $set: {
            'documents.$.status': data.Status,
            'documents.$.observation': data.Observation
        }
    }, { new: true }, (error, request) => {
        if (error)
            return handler.handleError(res, status.NOT_FOUND, { message: "Solicitud no procesada" });
        // console.log("reqq", request);
        const result = request.documents.filter(doc => doc.status === 'Accept' || doc.status === 'Omit');
        if (result.length === 14) {
            _request.findOneAndUpdate({ _id: _id }, {
                $set: {

                    // phase: eRequest.ASSIGNED,
                    phase: eRequest.VALIDATED,
                    status: eStatusRequest.NONE,
                    // phase: eRequest.DELIVERED,
                    // status: result.length === 14 ? eStatusRequest.ACCEPT : eStatusRequest.PROCESS,//eStatusRequest.ACCEPT,
                    lastModified: new Date(),
                },
                $addToSet: {
                    history: {
                        phase: eRequest.DELIVERED,
                        achievementDate: new Date(),
                        doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                        observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                        status: eStatusRequest.ACCEPT
                    }
                }
            }).exec(handler.handleOne.bind(null, 'request', res));
        } else {

            if (result.length === 18) {
                _request.findOneAndUpdate({ _id: _id }, {
                    $set: {
                        phase: eRequest.TITLED,
                        status: eStatusRequest.ACCEPT,
                        lastModified: new Date(),
                    },
                    $addToSet: {
                        history: {
                            phase: eRequest.TITLED,
                            achievementDate: new Date(),
                            doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                            observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                            status: eStatusRequest.PROCESS
                        }
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
            }
            else {
                var json = {};
                json['request'] = request;
                return res.status(status.OK).json(json);
            }
        }
    })
};

const releasedRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    let panel = data.jury;
    _request.update({ _id: _id }, {
        $set: {
            phase: data.upload ? eRequest.RELEASED : eRequest.REGISTERED,
            status: eStatusRequest.NONE,
            proposedHour: data.proposedHour,
            duration: data.duration,
            lastModified: new Date(),
            jury: panel
        },
        $addToSet: {
            history: {
                phase: eRequest.REGISTERED,
                achievementDate: new Date(),
                doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                status: eStatusRequest.ACCEPT
            }
        }
    }).exec(handler.handleOne.bind(null, 'request', res));

};

const updateRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    // console.log("Data", data);
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
                    // request.status = eStatusRequest.PROCESS; 17/11
                    request.status = eStatusRequest.NONE;
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
                    // request.status = eStatusRequest.PROCESS; 17/11
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT;
                    request.documents.push(
                        {
                            type: eFile.SOLICITUD, dateRegister: new Date(), nameFile: 'Solicitud', status: "Accept"
                        });
                } else {
                    request.phase = eRequest.CAPTURED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.REJECT;
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
                    // request.status = eStatusRequest.PROCESS; 17/11
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT;
                    request.documents.push(
                        {
                            type: eFile.REGISTRO, dateRegister: new Date(), nameFile: 'Registro', status: "Accept"
                        });
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
                    item.status = eStatusRequest.ACCEPT;
                }
                break;
            }
            case eRequest.RELEASED: {
                if (data.operation === eStatusRequest.REJECT) {
                    request.phase = eRequest.REGISTERED;
                    request.status = eStatusRequest.REJECT;
                    item.status = eStatusRequest.REJECT;
                }
                else {
                    request.phase = eRequest.DELIVERED;
                    request.status = eStatusRequest.NONE;
                    request.documents.push(
                        {
                            type: eFile.PHOTOS, dateRegister: new Date(), nameFile: 'Fotos', status: "Process"
                        });
                    item.status = eStatusRequest.ACCEPT
                }
                break;
            }
            case eRequest.DELIVERED: {
                // if (data.operation === eStatusRequest.REJECT) {
                //     request.phase = eRequest.DELIVERED;
                //     request.status = eStatusRequest.PROCESS;
                //     item.status = eStatusRequest.REJECT;
                // }
                // else {
                //     request.phase = eRequest.ASSIGNED;
                //     request.documents.push(
                //         {
                //             type: eFile.INCONVENIENCE, dateRegister: new Date(), nameFile: 'No_Inconveniencia', status: "Accept"
                //         });
                //     request.status = eStatusRequest.NONE;
                //     item.status = eStatusRequest.ACCEPT
                // }
                break;
            }
            case eRequest.VALIDATED: {
                if (data.operation === eStatusRequest.REJECT) {
                    request.phase = eRequest.DELIVERED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.REJECT;
                }
                else {
                    if (typeof (data.duration) !== 'undefined') {
                        request.duration = data.duration;
                    }
                    request.phase = eRequest.ASSIGNED;
                    request.documents.push(
                        {
                            type: eFile.INCONVENIENCE, dateRegister: new Date(), nameFile: 'No_Inconveniencia', status: "Accept"
                        });
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT
                }
                break;
            }
            case eRequest.ASSIGNED: {
                switch (data.operation) {
                    case eStatusRequest.PROCESS: {
                        request.status = eStatusRequest.PROCESS;
                        request.proposedDate = data.appointment;
                        request.place = 'Aula de Titulación';
                        item.status = eStatusRequest.PROCESS;
                        break;
                        // None->Process->Aceptada
                        // None-Process->REJECT
                        // Reject->Process
                        // None-Process->Wait
                        // Wait->ACCEPT

                    }
                    case eStatusRequest.ASSIGN: {
                        if (typeof (data.duration) !== 'undefined') {
                            request.duration = data.duration;
                        }
                        request.phase = eRequest.REALIZED;
                        request.proposedDate = data.appointment;
                        request.proposedHour = data.minutes;
                        request.status = eStatusRequest.PROCESS;
                        request.place = data.place;
                        item.status = eStatusRequest.ACCEPT;
                        break;
                    }
                    case eStatusRequest.ACCEPT: {
                        request.phase = eRequest.REALIZED;
                        request.status = eStatusRequest.PROCESS;
                        item.status = eStatusRequest.ACCEPT;
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        request.status = eStatusRequest.REJECT;
                        item.status = eStatusRequest.REJECT;
                        break;
                    }
                }
                break;
            }
            case eRequest.REALIZED: {
                let tmpDateCompare = new Date();
                let tmpDateRequest = new Date(request.proposedDate);
                tmpDateRequest.setHours(0, 0, 0, 0);
                tmpDateRequest.setHours(request.proposedHour / 60, request.proposedHour % 60, 0, 0);
                switch (data.operation) {
                    case eStatusRequest.CANCELLED: {
                        if (tmpDateCompare.getTime() > tmpDateRequest.getTime()) {
                            return handler.handleError(res, status.BAD_REQUEST, { message: 'Operación no válida: Evento Inamovible' });
                        }
                        request.phase = eRequest.ASSIGNED;
                        request.status = eStatusRequest.CANCELLED;
                        item.status = eStatusRequest.CANCELLED;
                        item.phase = 'Asignado';
                        break;
                    }
                    case eStatusRequest.ACCEPT: {

                        // if (tmpDateCompare.getTime() < (tmpDateRequest.getTime() + 3600000)) {
                        //     // return res.status(status.BAD_REQUEST).json({ message: 'Operación no válida: Evento no realizado aún' });
                        //     return handler.handleError(res, status.BAD_REQUEST, { message: 'Operación no válida: Evento no realizado aún' });
                        // }
                        request.phase = eRequest.GENERATED;
                        request.status = eStatusRequest.NONE;
                        item.status = eStatusRequest.ACCEPT;
                        item.phase = 'Realizado';
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        // if (tmpDateCompare.getTime() < (tmpDateRequest.getTime() + 3600000)) {
                        //     // return res.status(status.BAD_REQUEST).json({ message: 'Operación no válida: Evento no realizado aún' });
                        //     return handler.handleError(res, status.BAD_REQUEST, { message: 'Operación no válida: Evento no realizado aún' });
                        // }
                        request.status = eStatusRequest.REJECT;
                        item.status = eStatusRequest.REJECT;
                        item.phase = 'Realizado';
                        break;
                    }
                }
                break;
            }
            case eRequest.GENERATED: {
                switch (data.operation) {
                    //Fue generada el acta
                    case eStatusRequest.PROCESS: {
                        request.status = eStatusRequest.PRINTED;
                        item.phase = 'Generado';
                        item.status = eStatusRequest.PROCESS;
                        break;
                    }
                    //Fue impresa el acta
                    case eStatusRequest.PRINTED: {
                        request.status = eStatusRequest.ACCEPT;
                        item.phase = 'Generado';
                        item.status = eStatusRequest.PROCESS;
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        request.phase = eRequest.REALIZED;
                        request.status = eStatusRequest.PROCESS;
                        item.phase = 'Generado';
                        item.status = eStatusRequest.REJECT;
                    }
                    //Se valida que el titulado paso por ella
                    case eStatusRequest.ACCEPT: {
                        request.phase = eRequest.TITLED;
                        request.status = eStatusRequest.NONE;
                        item.status = eStatusRequest.ACCEPT
                        item.phase = 'Generado';
                    }
                }
                break;
            }
            case eRequest.TITLED: {
                switch (data.operation) {
                    //Fue notificado al alumno que pase por el título
                    case eStatusRequest.PROCESS: {
                        request.status = eStatusRequest.PROCESS;
                        item.phase = 'Titulado';
                        item.status = eStatusRequest.NONE;
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        request.phase = eRequest.GENERATED;
                        request.status = eStatusRequest.NONE;
                        item.phase = 'Titulado';
                        item.status = eStatusRequest.REJECT;
                    }
                    //Se valida que pasarón por el titulo
                    case eStatusRequest.FINALIZED: {
                        request.phase = eRequest.TITLED;
                        request.status = eStatusRequest.FINALIZED;
                        item.status = eStatusRequest.ACCEPT
                        item.phase = 'Titulado';
                    }
                }
                break;
            }
        }
        request.history.push(item);
        request.doer = data.doer;
        request.observation = data.observation;
        request.lastModified = new Date();

        request.save((errorReq, response) => {
            if (errorReq) {
                // console.log(errorReq);
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, errorReq);
            }
            var json = {};
            json['request'] = response;
            return res.status(status.OK).json(json);
        });
    });
};

const groupDiary = (req, res) => {
    let data = req.body;
    // let StartDate = new Date();
    // StartDate.setDate(1);
    // StartDate.setMonth(data.month);
    let StartDate = new Date(data.year, data.month, 1, 0, 0, 0, 0);
    let EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0,23,59,59,0);    
    let query =
        [
            {
                $match: {
                    "proposedDate": { $gte: StartDate, $lte: EndDate },
                    $or: [{ "phase": "Asignado", "status": "Process" }, { "phase": "Realizado" }]
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "Student"
                }
            },
            {
                $group: {
                    _id: '$Student.career',
                    values:
                    {
                        $push: {
                            id: '$_id', student: '$Student.fullName', proposedDate: '$proposedDate', proposedHour: '$proposedHour', phase: "$phase",
                            jury: '$jury', place: '$place', project: '$projectName', duration: '$duration'
                        }
                    }
                }
            }
        ];
    _request.aggregate(query, (error, diary) => {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });        
        _ranges.find(
            {
                $or: [{ start: { $gte: StartDate, $lte: EndDate } },
                { end: { $gte: StartDate, $lte: EndDate } },
                { start: { $gte: StartDate, $lte: EndDate } },
                { $and: [{ start: { $lte: StartDate } }, { end: { $gte: StartDate } }] }
                ]
            }
            , function (error, ranges) {
                if (error)
                    return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
                res.status(status.OK);
                res.json({ Diary: diary, Ranges: ranges });
            });
    });

    //.exec(handler.handleMany.bind(null, 'Diary', res));
}
const groupRequest = (req, res) => {
    let data = req.body;
    let StartDate = new Date(data.year, data.month, 1, 0, 0, 0, 0);
    // StartDate.setFullYear(data.year);        
    // StartDate.setMonth(data.month);
    // StartDate.setHours(0, 0, 0, 0);
    // let EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0);
    let EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0,23,59,59,0);
    // console.log("Start", StartDate, "End", EndDate);
    let query =
        [
            {
                $match: {
                    "proposedDate": { $gte: StartDate, $lte: EndDate }, $or: [
                        // { "phase": "Asignado", "status": "Process" },
                        { "phase": "Realizado", "status": "Process" }]
                }

            },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "Student"
                }
            },
            {
                // _id: { company: "$company", event: "$event" },
                $group: {
                    _id: {
                        minutes: '$proposedHour', career: '$Student.career', date: '$proposedDate'
                        // date: { $dateToString: { format: "%Y-%m-%d", date: '$proposedDate' } }
                    },
                    count: { $sum: 1 }
                }
            }
        ];
    _request
        .aggregate(query, (error, schedule) => {
            if (error)
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
            _ranges.find(
                {
                    $or: [{ start: { $gte: StartDate, $lte: EndDate } },
                    { end: { $gte: StartDate, $lte: EndDate } },
                    { start: { $gte: StartDate, $lte: EndDate } },
                    { $and: [{ start: { $lte: StartDate } }, { end: { $gte: StartDate } }] }
                    ]
                }
                , function (error, ranges) {
                    if (error)
                        return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
                    res.status(status.OK);
                    res.json({ Schedule: schedule, Ranges: ranges });
                });
        });
    //.exec(handler.handleMany.bind(null, 'Schedule', res));
}

const StudentsToSchedule = (req, res) => {
    let query =
        [
            {
                $match: {
                    "phase": "Asignado",
                    $or: [
                        { "status": "None" },
                        { "status": "Cancelled" },
                        { "status": "Reject" }
                    ]
                }
            },
            {
                $lookup: {
                    from: "students", localField: "studentId", foreignField: "_id", as: "Student"
                }
            },
            {
                $project: {
                    Student: 1, phase: 1, status: 1
                }
            }
        ];
    _request.aggregate(query).exec(handler.handleMany.bind(null, 'Students', res));
}


module.exports = (Request, Range, Folder) => {
    _request = Request;
    _ranges = Range;
    _Drive = require('../app/google-drive.controller')(Folder);
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
        omitFile,
        getResource,
        groupDiary,
        fileCheck,
        groupRequest,
        StudentsToSchedule
    });
};
