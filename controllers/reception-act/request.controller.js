const handler = require('../../utils/handler');
const status = require('http-status');
const path = require('path');
const fs = require('fs');

const { eRequest, eStatusRequest, eRole, eFile, eOperation } = require('../../enumerators/reception-act/enums');
const sendMail = require('../shared/mail.controller');
const verifyCodeTemplate = require('../../templates/verifyCode');
const mailTemplate = require('../../templates/notificationMailReception');

let _Drive;
let _request;
let _ranges;
let _student;

const create = async (req, res) => {
    let request = req.body;
    const _req = await _getRequest(req.params._id);
    if (_req) {
        req.params._id = _req._id;
        return findOneRequest(req, res);
    }
    request.lastModified = new Date();
    request.applicationDate = new Date();
    request.studentId = req.params._id;
    //Add 08/08/2019
    request.phase = eRequest.CAPTURED;
    request.status = eStatusRequest.PROCESS;
    //Add
    request.department = { name: request.department, boss: request.boss };
    request.adviser = {
        name: request.adviserName,
        title: request.adviserTitle,
        cedula: request.adviserCedula,
        email: request.adviserEmail
    };
    request.grade = await _getGradeName(request.studentId);
    if (!request.grade) {
        return res.status(status.INTERNAL_SERVER_ERROR)
            .json({ error: 'Error al recuperar grado' });
    }
    request.verificationCode = _generateVerificationCode(6);
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
            // Send email with verification code
            const emailData = {
                email: request.email,
                subject: 'Acto recepcional - Verificación de correo electrónico',
                sender: 'Servicios escolares <escolares_05@ittepic.edu.mx>',
                message: verifyCodeTemplate(request.verificationCode)
            };
            _sendEmail(emailData)
                .then(async data => {
                    if (data.code === 202) {
                        await _updateSentVerificationCode(created._id, true);
                        res.status(status.OK).json({ request: created })
                    } else {
                        await _updateSentVerificationCode(created._id, false);
                        res.status(status.OK)
                            .json({
                                code: status.INTERNAL_SERVER_ERROR,
                                request: created,
                                error: 'Error al envíar el correo'
                            });
                    }
                });
        }).catch(err => {
            console.log("errr", err);
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

const createTitled = (req, res) => {
    let request = req.body;
    request.applicationDate = new Date();
    request.lastModified = new Date();
    _request.findOne({ studentId: request.studentId }, (error, titled) => {
        if (error) {
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        }
        if (titled) {
            return handler.handleError(res, status.NOT_FOUND, { message: 'El estudiante ya cuenta con una solicitud' });
        }
        else {
            _request.create(request).then(created => {
                res.json({
                    request: created
                });
            }).catch(err => {
                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                })
            });
        }
    })

}

const removeTitled = (req, res) => {
    const { id } = req.params;
    _request.deleteOne({ _id: id }, function (error) {
        if (error)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { message: 'Titulación no encontrada' });
        return res.status(200).json({ message: "Successful" });
    });
};

const getAllRequest = (req, res) => {
    _request.find({ status: { $ne: 'Aprobado' } })
        .populate
        ({
            path: 'studentId', model: 'Student',
            populate: { path: 'careerId', model: 'Career' },
            select: {
                fullName: 1,
                controlNumber: 1,
                career: 1,
                careerId: 1
            }
        }).sort({ applicationDate: 1 })
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
                    populate: { path: 'careerId', model: 'Career' },
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1,
                        careerId: 1
                    }
                }).sort({ applicationDate: 1 })
                .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        case eRole.eHEADSCHOOLSERVICE: {
            _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado'] } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
                    populate: { path: 'careerId', model: 'Career' },
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1,
                        careerId: 1,
                    }
                }).sort({ applicationDate: 1 })
                .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        case eRole.eCOORDINATION: {
            _request.find({ phase: { $ne: 'Capturado' } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
                    populate: { path: 'careerId', model: 'Career' },
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1,
                        careerId: 1,
                    }
                }).sort({ applicationDate: 1 })
                .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        case eRole.eCHIEFACADEMIC: {
            _request.find({ phase: { $nin: ['Capturado', 'Enviado'] } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
                    populate: { path: 'careerId', model: 'Career' },
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1,
                        careerId: 1,
                    }
                }).sort({ applicationDate: 1 })
                .exec(handler.handleMany.bind(null, 'request', res));
            break;
        }
        case eRole.eSTUDENTSERVICES: {
            _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado'] } })
                .populate
                ({
                    path: 'studentId', model: 'Student',
                    populate: { path: 'careerId', model: 'Career' },
                    select: {
                        fullName: 1,
                        controlNumber: 1,
                        career: 1,
                        careerId: 1,
                    }
                }).sort({ applicationDate: 1 })
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
        populate: { path: 'careerId', model: 'Career' },
        select: {
            fullName: 1,
            controlNumber: 1,
            career: 1,
            careerId: 1,
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

    let depto = { name: request.department, boss: request.boss };
    delete request.boss;
    delete request.department;
    request.department = depto;
    if (request.verificationCode === '000000') {
        request.verificationCode = _generateVerificationCode(6);
    }
    let result = { isCorrect: true };//Valor por defecto
    if (typeof (req.files) !== 'undefined' && req.files !== null)
        result = await _Drive.uploadFile(req, eOperation.EDIT);
    if (typeof (result) !== 'undefined' && result.isCorrect) {
        _request.findOneAndUpdate({ studentId: _id }, request)
            .then(update => {
                // Send email with verification code
                if (request.verificationCode) {
                    const emailData = {
                        email: request.email,
                        subject: 'Acto recepcional - Verificación de correo electrónico',
                        sender: 'Servicios escolares <escolares_05@ittepic.edu.mx>',
                        message: verifyCodeTemplate(request.verificationCode)
                    };
                    _sendEmail(emailData)
                        .then(async data => {
                            if (data.code === 202) {
                                await _updateSentVerificationCode(update._id, true);
                                res.status(status.OK).json({ request: update })
                            } else {
                                await _updateSentVerificationCode(update._id, false);
                                res.status(status.OK)
                                    .json({
                                        code: status.INTERNAL_SERVER_ERROR,
                                        request: update,
                                        error: 'Error al envíar el correo'
                                    });
                            }
                        });
                } else {
                    res.status(status.OK).json({ request: update })
                }
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
};

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
};

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
    const isJsPdf = typeof (data.isJsPdf) !== 'undefined' ? data.isJsPdf : false;
    // const files = req.files;    
    const files = isJsPdf ? data.file : req.files;
    _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } },
        async (error, request) => {
            if (error) {
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
            }
            // const docName = data.Document + path.extname(files.file.name);
            const docName = data.Document + path.extname((isJsPdf ? files.name : files.file.name));
            if (!request) {
                let result = await _Drive.uploadFile(req, eOperation.NEW, isJsPdf);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    _request.update({ _id: _id }, {
                        $set: {
                            status: eStatusRequest.PROCESS,
                            phase: data.phase
                            // phase: eRequest.DELIVERED
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
                let result = await _Drive.uploadFile(req, eOperation.EDIT, isJsPdf);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    _request.update({
                        _id: _id,
                        documents: { $elemMatch: { type: data.Document } }
                    }, {
                        $set: {
                            status: eStatusRequest.PROCESS,
                            // phase: eRequest.DELIVERED,
                            phase: data.phase,
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
};

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
            console.log(`${__dirname}/../../documents/tmpFile/${tmpName}`);
            const fullPath = path.normalize(`${__dirname}/../../documents/tmpFile/${tmpName}`);
            res.set('Content-Type', 'application/pdf');
            fs.createReadStream(fullPath).pipe(res);            
            fs.unlinkSync(fullPath);
        }
        else {
            return res.status(status.BAD_REQUEST).json({ message: 'Documento no encontrado' });
        }
    });
};

const getResourceLink = (req, res) => {
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

        console.log("FILE INFORMACION", fileInformation);
        const tmpName = resource.toUpperCase() + "_" + _id + ".pdf";
        let result = await _Drive.getWebLink(fileInformation.driveId);
        if (typeof (result) !== 'undefined' && result.isCorrect) {
            var json = { document: result.WebLink };
            return res.status(status.OK).json(json);
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

        // Documentos primera parte (CURP, ACTA, etc)
        const docs = request.documents.filter(doc => doc.type === 'FOTOS' || doc.type === '4_CEDULA_TECNICA' || doc.type === 'REVALIDACION' || doc.type === '2_ACTA_NACIMIENTO' || doc.type === '1_CURP' || doc.type === '3_CERTIFICADO_BACHILLERATO' || doc.type === '5_CERTIFICADO_LICENCIATURA' || doc.type === 'SERVICIO_SOCIAL' || doc.type === 'LIBERACION_INGLES' || doc.type === 'RECIBO');
        const docsAcept = docs.filter(doc => doc.status === 'Accept' || doc.status === 'Omit');
        const docsReject = docs.filter(doc => doc.status === 'Reject');
        const numDocsAR = (docsAcept.length + docsReject.length);

        // Documentos segunda parte (INE, CEDULA y XML)
        const docsTitle = request.documents.filter(doc => doc.type === 'INE' || doc.type === 'CEDULA_PROFESIONAL' || doc.type === 'XML');
        const docsTitleAcept = docsTitle.filter(doc => doc.status === 'Accept');
        const docsTitleReject = docsTitle.filter(doc => doc.status === 'Reject');
        const numDocsTitleAR = (docsTitleAcept.length + docsTitleReject.length);

        if (numDocsTitleAR === 0) {
            console.log(numDocsAR+" de 10 documentos dictaminados");
            if (numDocsAR === 10) {
                console.log("Todos los documentos fueron dictaminados");
                const email = request.email;
                const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
                const subject = 'Acto recepcional - Resultado de validación de documentos';
                const subtitle = 'Acuse de documentos entregados';
                var body = '';
                var documents = '<ol style="text-align:left">';
                for (var i = 0; i < docs.length; i++) {
                    switch (docs[i].type) {
                        case 'FOTOS':
                            documents += '<li>' + 'FOTOS : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case '4_CEDULA_TECNICA':
                            documents += '<li>' + 'CÉDULA TÉCNICA : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case 'REVALIDACION':
                            documents += '<li>' + 'REVALIDACIÓN : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case '2_ACTA_NACIMIENTO':
                            documents += '<li>' + 'ACTA DE NACIMIENTO : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case '1_CURP':
                            documents += '<li>' + 'CURP : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case '3_CERTIFICADO_BACHILLERATO':
                            documents += '<li>' + 'CERTIFICADO DE BACHILLERATO : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case '5_CERTIFICADO_LICENCIATURA':
                            documents += '<li>' + 'CERTIFICADO DE LICENCIATURA : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case 'SERVICIO_SOCIAL':
                            documents += '<li>' + 'SERVICIO SOCIAL : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case 'LIBERACION_INGLES':
                            documents += '<li>' + 'LIBERACIÓN DE INGLÉS : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                        case 'RECIBO':
                            documents += '<li>' + 'RECIBO DE PAGO : ' + (docs[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docs[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docs[i].observation) + '</li>';
                            break;
                    }
                }
                documents += '</ol>';
                if (docsReject.length === 0) {
                    body = 'Su documentación fue aceptada, espera tu carta de no inconveniencia.';
                } else {
                    body = 'Se encontraron errores en su documentación, favor de corregirlos:';
                }
                const message = mailTemplate(subtitle, body, documents);
                _sendEmail({ email: email, subject: subject, sender: sender, message: message });
            }
        } else {
            console.log(numDocsTitleAR+" de 3 documentos dictaminados");
            if (numDocsTitleAR === 3) {
                console.log("Todos los documentos fueron dictaminados");
                const email = request.email;
                const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
                const subject = 'Acto recepcional - Resultado de validación de documentos para recoger título';
                const subtitle = 'Resultado de validación de documentos';
                var body = '';
                var documents = '<ol style="text-align:left">';
                for (var i = 0; i < docsTitle.length; i++) {
                    switch (docsTitle[i].type) {
                        case 'INE':
                            documents += '<li>' + 'INE : ' + (docsTitle[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docsTitle[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docsTitle[i].observation) + '</li>';
                            break;
                        case 'CEDULA_PROFESIONAL':
                            documents += '<li>' + 'CÉDULA PROFESIONAL : ' + (docsTitle[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docsTitle[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docsTitle[i].observation) + '</li>';
                            break;
                        case 'XML':
                            documents += '<li>' + 'XML : ' + (docsTitle[i].status == 'Accept' ? '<span style = "color:green">ACEPTADO</span>' : docsTitle[i].status == 'Omit' ? '<span style = "color:#87807E">OMITIDO</span>' : '<span style = "color:red">RECHAZADO</span> - ' + docsTitle[i].observation) + '</li>';
                            break;
                    }
                }
                documents += '</ol>';

                if (docsTitleReject.length === 0) {
                    body = 'Su documentación fue aceptada. Para recoger tu título:';
                    body += '<div style="text-align:center;">' +
                        '<img src="https://i.ibb.co/nwG8LSP/tabla-Requisitos-Titulo.png" width="100%">' +
                        '</div>'
                } else {
                    body = 'Se encontraron errores en su documentación, favor de corregirlos:';
                }
                const message = mailTemplate(subtitle, body, documents);
                _sendEmail({ email: email, subject: subject, sender: sender, message: message });
            }
        }

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
            if (result.length >= 14) {
                console.log("es 20", result.length, result.length === 20);
                if (result.length === 20) {
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
                } else {
                    if (request.documents.length === 19) {
                        _request.findOneAndUpdate({ _id: _id }, {
                            $set: {
                                status: eStatusRequest.PROCESS,
                                lastModified: new Date(),
                            }
                        }).exec(handler.handleOne.bind(null, 'request', res));
                    } else {
                        var json = {};
                        json['request'] = request;
                        return res.status(status.OK).json(json);
                    }
                }
            }
            else {
                _request.findOneAndUpdate({ _id: _id }, {
                    $set: {
                        phase: eRequest.DELIVERED,
                        status: eStatusRequest.PROCESS,
                        lastModified: new Date(),
                    }
                }).exec(handler.handleOne.bind(null, 'request', res));
                // var json = {};
                // json['request'] = request;
                // return res.status(status.OK).json(json);
            }
        }
    });
};

const releasedRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    let panel = data.jury;
    _request.update({ _id: _id }, {
        $set: {
            phase: data.upload ? eRequest.RELEASED : eRequest.REGISTERED,
            status: data.upload ? eStatusRequest.NONE : eStatusRequest.PROCESS,
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
    
    if(data.upload){
        const subtitle = 'Liberación de proyecto de acto protocolario';
        const body = 'Su proyecto ha sido liberado';
        const email = data.email;
        const subject = 'Acto recepcional - Liberación de proyecto';
        const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
        const message = mailTemplate(subtitle, body, '');
        _sendEmail({ email: email, subject: subject, sender: sender, message: message });
    }
};

const updateRequest = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    var subjectMail = '';
    var subtitleMail = '';
    var bodyMail = '';
    var observationsMail = '';
    let msnError = '';
    _request.findOne({ _id: _id }).exec(async (error, request) => {
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
        switch (data.phase) {
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
                    subjectMail = 'Acto recepcional - Validación de solicitud';
                    subtitleMail = 'Validación de solicitud de acto protocolario';
                    bodyMail = 'Su solicitud ha sido aceptada';
                    observationsMail = item.observation;
                    request.phase = eRequest.VERIFIED;
                    // request.status = eStatusRequest.PROCESS; 17/11
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT;
                    req.body.Document = eFile.SOLICITUD;
                    let isUploadFile = await _Drive.uploadFile(req, eOperation.NEW, true);
                    if (typeof (isUploadFile) !== 'undefined' && isUploadFile.isCorrect) {
                        request.documents.push({
                            type: eFile.SOLICITUD, dateRegister: new Date(), nameFile: eFile.SOLICITUD, status: 'Accept', driveId: isUploadFile.fileId
                        });
                    }
                    else {
                        msnError = 'Archivo no cargado';
                    }
                } else {
                    request.phase = eRequest.CAPTURED;
                    request.status = eStatusRequest.PROCESS;
                    item.status = eStatusRequest.REJECT;
                    subjectMail = 'Acto recepcional - Validación de solicitud';
                    subtitleMail = 'Validación de solicitud de acto protocolario';
                    bodyMail = 'Su solicitud ha sido rechazada';
                    observationsMail = item.observation;
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
                    subjectMail = 'Acto recepcional - Registro de proyecto';
                    subtitleMail = 'Registro de proyecto de acto protocolario';
                    bodyMail = 'Su proyecto ha sido registrado';
                    observationsMail = item.observation;
                    request.phase = eRequest.REGISTERED;
                    // request.status = eStatusRequest.PROCESS; 17/11
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT;
                    req.body.Document = eFile.REGISTRO;
                    let isUploadFile = await _Drive.uploadFile(req, eOperation.NEW, true);
                    if (typeof (isUploadFile) !== 'undefined' && isUploadFile.isCorrect) {
                        request.documents.push({
                            type: eFile.REGISTRO, dateRegister: new Date(), nameFile: eFile.REGISTRO, status: 'Accept', driveId: isUploadFile.fileId
                        });
                    }
                    else {
                        msnError = 'Archivo no cargado';
                    }
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
                    subjectMail = 'Acto recepcional - Validación de liberación de proyecto';
                    subtitleMail = 'Validación de formato de liberación de proyecto';
                    bodyMail = 'Liberación aceptada';
                    observationsMail = item.observation;
                    request.phase = eRequest.DELIVERED;
                    request.status = eStatusRequest.NONE;
                    const photos = await getRequestPhotos(_id);                    
                    
                    if(photos === undefined){
                        request.documents.push(
                            {
                                type: eFile.PHOTOS, dateRegister: new Date(), nameFile: 'Fotos', status: "Process"
                            });
                    }
                    
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
                    subjectMail = 'Acto recepcional - Constancia de no inconveniencia';
                    subtitleMail = 'Generación de Constancia de No Inconveniencia';
                    bodyMail = 'Su Constancia de No Inconveniencia fue generada';
                    request.phase = eRequest.ASSIGNED;
                    // request.documents.push(
                    //     {
                    //         type: eFile.INCONVENIENCE, dateRegister: new Date(), nameFile: 'No_Inconveniencia', status: "Accept"
                    //     });
                    request.status = eStatusRequest.NONE;
                    item.status = eStatusRequest.ACCEPT
                    req.body.Document = eFile.INCONVENIENCE;
                    let isUploadFile = await _Drive.uploadFile(req, eOperation.NEW, true);
                    if (typeof (isUploadFile) !== 'undefined' && isUploadFile.isCorrect) {
                        request.documents.push({
                            type: eFile.INCONVENIENCE, dateRegister: new Date(), nameFile: eFile.INCONVENIENCE, status: 'Accept', driveId: isUploadFile.fileId
                        });
                    }
                    else {
                        msnError = 'Archivo no cargado';
                    }
                }
                break;
            }
            case eRequest.ASSIGNED: {
                switch (data.operation) {
                    case eStatusRequest.PROCESS: {
                        request.status = eStatusRequest.PROCESS;
                        request.proposedDate = data.appointment;
                        request.place = 'Magna de Titulación (J3)';
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
                        request.status = eStatusRequest.NONE;
                        request.place = data.place;
                        item.status = eStatusRequest.ACCEPT;
                        break;
                    }
                    case eStatusRequest.ACCEPT: {
                        subjectMail = 'Acto recepcional - Confirmación de fecha de titulación';
                        subtitleMail = 'Confirmación de fecha de titulación';
                        bodyMail = 'Tu fecha solicitada ha sido confirmada';
                        request.phase = eRequest.REALIZED;
                        request.status = eStatusRequest.NONE;
                        item.status = eStatusRequest.ACCEPT;
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        subjectMail = 'Acto recepcional - Confirmación de fecha de titulación';
                        subtitleMail = 'Confirmación de fecha de titulación';
                        bodyMail = 'Tu fecha solicitada ha sido rechazada';
                        observationsMail = item.observation;
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
                    case eStatusRequest.PROCESS: {
                        request.phase = eRequest.REALIZED;
                        request.status = eStatusRequest.PROCESS;
                        item.status = eStatusRequest.NONE;
                        break;
                    }
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
                        subjectMail = 'Acto recepcional - Aprobación de acto protocolario';
                        subtitleMail = 'Aprobación de acto protocolario';
                        bodyMail = 'Su acto protocolario ha sido aprobado';
                        observationsMail = item.observation;
                        request.phase = eRequest.GENERATED;
                        request.status = eStatusRequest.NONE;
                        request.registry = data.registry;
                        item.status = eStatusRequest.ACCEPT;
                        item.phase = 'Realizado';
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        // if (tmpDateCompare.getTime() < (tmpDateRequest.getTime() + 3600000)) {
                        //     // return res.status(status.BAD_REQUEST).json({ message: 'Operación no válida: Evento no realizado aún' });
                        //     return handler.handleError(res, status.BAD_REQUEST, { message: 'Operación no válida: Evento no realizado aún' });
                        // }
                        subjectMail = 'Acto recepcional - Aprobación de acto protocolario';
                        subtitleMail = 'Aprobación de acto protocolario';
                        bodyMail = 'Su acto protocolario no ha sido aprobado y su titulación está rechazada';
                        observationsMail = item.observation;
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
                        item.status = eStatusRequest.NONE;
                        break;
                    }
                    //Fue impresa el acta
                    case eStatusRequest.PRINTED: {
                        subjectMail = 'Acto recepcional - Acta de examen profesional';
                        subtitleMail = 'Acta de examen profesional';
                        bodyMail = 'Su acta ha sido impresa';
                        observationsMail = item.observation;
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
                        subjectMail = 'Acto recepcional - Acta de examen profesional';
                        subtitleMail = 'Acta de examen profesional';
                        bodyMail = 'Su acta ha sido entregada';
                        observationsMail = item.observation;
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
                        subjectMail = 'Acto recepcional - Título entregado';
                        subtitleMail = 'Título entregado';
                        bodyMail = 'Su título ha sido entregado';
                        observationsMail = item.observation;
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
        if (msnError !== '') {
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { message: msnError });
        }
        else {
            request.save((errorReq, response) => {
                if (errorReq) {
                    // console.log(errorReq);
                    return handler.handleError(res, status.INTERNAL_SERVER_ERROR, errorReq);
                }
                var json = {};
                json['request'] = response;
                // Enviar correo
                const subject = subjectMail;
                const subtitle = subtitleMail;
                const body = bodyMail;
                const observations = observationsMail;
                const email = request.email;
                const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
                const message = mailTemplate(subtitle, body, observations);
                _sendEmail({ email: email, subject: subject, sender: sender, message: message });
                return res.status(status.OK).json(json);
            });
        }
    });
};

const getRequestPhotos = (_id) =>{
    return new Promise((resolve)=>{
        _request.findOne({ _id: _id },{documents:1}).then(
            (request)=>resolve(request.documents.filter( (doc)=> doc.type === eFile.PHOTOS)[0])
        ).catch(
            (err)=>resolve(false)
        );
    });
};

const groupDiary = (req, res) => {
    let data = req.body;
    // let StartDate = new Date();
    // StartDate.setDate(1);
    // StartDate.setMonth(data.month);    
    let StartDate;
    let EndDate;
    if (data.isWeek) {
        let tmpDate = new Date(data.min);
        StartDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 0, 0, 0, 0);
        tmpDate = new Date(data.max);
        EndDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate(), 23, 59, 59, 0);
    } else {
        StartDate = new Date(data.year, data.month, 1, 0, 0, 0, 0);
        EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0, 23, 59, 59, 0);
    }
    console.log("FECHAS", StartDate, "--", EndDate);
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
                            jury: '$jury', place: '$place', project: '$projectName', duration: '$duration', product: '$product', option: '$titulationOption'
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
};

const groupRequest = (req, res) => {
    let data = req.body;
    let StartDate = new Date(data.year, data.month, 1, 0, 0, 0, 0);
    // StartDate.setFullYear(data.year);        
    // StartDate.setMonth(data.month);
    // StartDate.setHours(0, 0, 0, 0);
    // let EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0);
    let EndDate = new Date(StartDate.getFullYear(), data.month + 1, 0, 23, 59, 59, 0);
    // console.log("Start", StartDate, "End", EndDate);
    let query =
        [
            {
                $match: {
                    "proposedDate": { $gte: StartDate, $lte: EndDate }, $or: [
                        { "phase": "Realizado", "status": "Process" },
                        { "phase": "Realizado", "status": "None" }]
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
};

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
};

const verifyCode = (req, res) => {
    const { _requestId, _code } = req.params;
    _request.findOne({ _id: _requestId })
        .then(request => {
            if (request.verificationCode === _code) {
                _request.updateOne({ _id: _requestId }, { $set: { verificationStatus: true } })
                    .then(_ => res.status(status.OK).json({ message: 'Correo verificado' }))
                    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'Error al verificar código' }))
            } else {
                res.status(status.INTERNAL_SERVER_ERROR)
                    .json({ error: 'Código incorrecto' });
            }
        })
        .catch(_ => {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: 'Error al verificar código' });
        });
};

const sendVerificationCode = (req, res) => {
    const { _requestId } = req.params;
    _request.findOne({ _id: _requestId })
        .then(request => {
            if (request.verificationCode) {
                const emailData = {
                    email: request.email,
                    subject: 'Acto recepcional - Verificación de correo electrónico',
                    sender: 'Servicios escolares <escolares_05@ittepic.edu.mx>',
                    message: verifyCodeTemplate(request.verificationCode)
                };
                _sendEmail(emailData)
                    .then(async data => {
                        if (data.code === 202) {
                            await _updateSentVerificationCode(request._id, true);
                            res.status(status.OK).json({ message: 'Correo envíado con éxito' })
                        } else {
                            await _updateSentVerificationCode(request._id, false);
                            res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'Error al envíar el correo' });
                        }
                    })
            }
        })
        .catch(_ => res.status(status.BAD_REQUEST).json({ error: 'Error, solicitud no encontrada' }));
};

const _getGradeName = (studentId) => {
    return new Promise(resolve => {
        _student.findOne({ _id: studentId })
            .populate('careerId')
            .then(student =>
                resolve(student.sex === 'F' ? student.careerId.grade.female : student.careerId.grade.male))
            .catch(_ => resolve(null));
    });
};

const _generateVerificationCode = (length) => {
    let number = '';
    while (number.length < length) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
};

const _sendEmail = ({ email, subject, sender, message }) => {
    return new Promise(resolve => {
        const emailData = {
            to_email: [email],
            subject: subject,
            sender: sender,
            message: message
        };
        sendMail({ body: emailData })
            .then(data => resolve(data));
    });
};

const _updateSentVerificationCode = (requestId, status) => {
    return new Promise(resolve => {
        _request.updateOne({ _id: requestId }, { $set: { sentVerificationCode: status } })
            .then(_ => resolve(true))
            .catch(_ => resolve(false));
    });
};

const changeJury = (req, res) => {
    const { _id } = req.params;
    let data = req.body;
    _request.update({ _id: _id }, {
        $set: {
            jury: data.Jury,
            proposedHour: data.Hour,
            duration: data.Duration
        },
        $addToSet: {
            history: {
                phase: eRequest.GENERATED,
                achievementDate: new Date(),
                doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                observation: 'Cambio de jurado',
                status: eStatusRequest.NONE
            }
        }
    }).exec(handler.handleOne.bind(null, 'request', res));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const findOneRequest = (req, res) => {
    const { _id } = req.params;
    _request.findOne({ _id: _id }).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1,
            controlNumber: 1,
            career: 1
        }
    }).exec(handler.handleOne.bind(null, 'request', res));
};

const _getRequest = (studentId) => {
    return new Promise(resolve => {
        _request.findOne({ studentId: studentId })
            .then(data => {
                if (data) {
                    resolve(data);
                } else {
                    resolve(null);
                }
            })
            .catch(_ => resolve(null));
    });
};

module.exports = (Request, Range, Folder, Student) => {
    _request = Request;
    _ranges = Range;
    _Drive = require('../app/google-drive.controller')(Folder);
    _student = Student;
    return ({
        create,
        createTitled,
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
        StudentsToSchedule,
        verifyCode,
        sendVerificationCode,
        removeTitled,
        getResourceLink,
        changeJury
    });
};
