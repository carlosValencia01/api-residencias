const handler = require('../../utils/handler');
const status = require('http-status');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
var https = require('https');
const QRCode = require('qrcode');

const { eRequest, eStatusRequest, eRole, eFile, eOperation } = require('../../enumerators/reception-act/enums');
const sendMail = require('../shared/mail.controller');
const verifyCodeTemplate = require('../../templates/verifyCode');
const mailTemplate = require('../../templates/notificationMailReception');
const mailTemplateSinodales = require('../../templates/notificationMailSinodales');

// Importar el archivo donde se emiten los eventos
const _socket = require('../../sockets/app.socket');

// Importar el archivo de los enumeradores
const eSocket = require('../../enumerators/shared/sockets.enum');

let _Drive;
let _Departments;
let _request;
let _DenyDays;
let _student;
let _period;
let _employee;

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
    request.periodId = (await getActivePeriod())._id;    
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
            _socket.broadcastEmit(eSocket.recActEvents.CREATE_OR_CANCEL_TITULATION,{newTitulation:true});
            _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{cancelTitulation:true});//solo para el calendario
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

const createTitled = async (req, res) => {
    let request = req.body;
    request.applicationDate = new Date();
    request.lastModified = new Date();
    request.periodId = (await getActivePeriod())._id;
    request.grade = await _getGradeName(request.studentId);
    const student = await getStudent(request.studentId);        
    request.email = student.email;
    request.telephone = student.phone;    
    
    _request.findOne({ studentId: request.studentId }, (error, titled) => {
        if (error) {
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
        }
        if (titled) {
            return handler.handleError(res, status.NOT_FOUND, { message: 'El estudiante ya cuenta con una solicitud' });
        }
        else {
            _request.create(request).then(async created => {
                _socket.broadcastEmit(eSocket.recActEvents.CREATE_OR_CANCEL_TITULATION,{newTitulation:true});
                _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{cancelTitulation:true});//solo para el calendario       
                res.status(status.OK).json({
                    request: created
                });
            }).catch(err => {
                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                })
            });
        }
    });
}

const removeTitled = (req, res) => {
    const { id } = req.params;
    _request.deleteOne({ _id: id }).then(deleted=>{
            _socket.broadcastEmit(eSocket.recActEvents.CREATE_OR_CANCEL_TITULATION,{cancelTitulation:true});
            _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{cancelTitulation:true});//solo para el calendario
            return res.status(200).json({ message: "Successful" });
    }).catch(error=>{
        return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { message: 'Titulación no encontrada' });
    });
};

const getAllRequest = async (req, res) => {
    const request = await (consultAllRequest());    
    _socket.singleEmit(eSocket.recActEvents.REQUEST_BY_ROLE,request,req.params.clientId);
    res.status(status.OK).json({sendBySocket:true});
};
const consultAllRequest = ()=>{    
    return new Promise((resolve)=>{
        _request.find({ status: { $ne: 'Aprobado' } })
        .populate
        ({
            path: 'studentId', model: 'Student',
            populate: { path: 'careerId', model: 'Career' },
            select: {
                fullName: 1,
                controlNumber: 1,
                career: 1,
                careerId: 1,
                sex:1
            }
        }).populate({
            path: 'periodId', model: 'Period',                   
            select: {
                periodName: 1,
                active: 1,
                year: 1,
                _id: 1
            }
        }).sort({ applicationDate: 1 })
        .then(request=>resolve({request}));
    });
};
const getRequestByStatus = async (req, res) => {
    const { phase } = req.params;
    // Recomendación
    // Colocar en un metodo aparte la consulta de
    // lo que se enviara al cliente ya que se tendra
    // que reutilizar
    const request = await consultRequestByStatus(phase);
    // Solo cuando es una consulta (GET) debe emitirse
    // el evento a quien solicita el recurso
    // por lo que en la ruta se debe agregar el :clientId
    // y enviarlo desde el cliente
    _socket.singleEmit(eSocket.recActEvents.REQUEST_BY_ROLE,request,req.params.clientId);
    // Terminar la petición HTTP
    res.status(status.OK).json({sendBySocket:true});
};

const consultRequestByStatus = (phase)=>{
    return new Promise((resolve)=>{
        switch (phase) {
            case eRole.eSECRETARY: {
                _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado'] } })
                    .populate({
                        path: 'studentId', model: 'Student',
                        populate: { path: 'careerId', model: 'Career' },
                        select: {
                            fullName: 1,
                            controlNumber: 1,
                            career: 1,
                            careerId: 1,
                            sex:1
                        }
                    })
                    .populate({
                        path: 'periodId', model: 'Period',                   
                        select: {
                            periodName: 1,
                            active: 1,
                            year: 1,
                            _id: 1
                        }
                    })
                    .sort({ applicationDate: 1 })
                    .then(request=>resolve({request}));
                break;
            }
            case eRole.eHEADSCHOOLSERVICE: {
                _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado'] } })
                    .populate({
                        path: 'studentId', model: 'Student',
                        populate: { path: 'careerId', model: 'Career' },
                        select: {
                            fullName: 1,
                            controlNumber: 1,
                            career: 1,
                            careerId: 1,
                            sex:1
                        }
                    }).populate({
                        path: 'periodId', model: 'Period',                   
                        select: {
                            periodName: 1,
                            active: 1,
                            year: 1,
                            _id: 1
                        }
                    })
                    .sort({ applicationDate: 1 })
                    .then(request=>resolve({request}));
                break;
            }
            case eRole.eCOORDINATION: {
                _request.find({ phase: { $ne: 'Capturado' } })
                    .populate({
                        path: 'studentId', model: 'Student',
                        populate: { path: 'careerId', model: 'Career' },
                        select: {
                            fullName: 1,
                            controlNumber: 1,
                            career: 1,
                            careerId: 1,
                            sex:1
                        }
                    }).populate({
                        path: 'periodId', model: 'Period',                   
                        select: {
                            periodName: 1,
                            active: 1,
                            year: 1,
                            _id: 1
                        }
                    })
                    .sort({ applicationDate: 1 })
                    .then(request=>resolve({request}));
                break;
            }
            case eRole.eCHIEFACADEMIC: {
                _request.find({ phase: { $nin: ['Capturado', 'Enviado'] } })
                    .populate({
                        path: 'studentId', model: 'Student',
                        populate: { path: 'careerId', model: 'Career' },
                        select: {
                            fullName: 1,
                            controlNumber: 1,
                            career: 1,
                            careerId: 1,
                            sex:1
                        }
                    }).populate({
                        path: 'periodId', model: 'Period',                   
                        select: {
                            periodName: 1,
                            active: 1,
                            year: 1,
                            _id: 1
                        }
                    })
                    .sort({ applicationDate: 1 })
                    .then(request=>resolve({request}));
                break;
            }
            case eRole.eSTUDENTSERVICES: {
                _request.find({ phase: { $nin: ['Capturado', 'Enviado', 'Verificado', 'Registrado'] } })
                    .populate({
                        path: 'studentId', model: 'Student',
                        populate: { path: 'careerId', model: 'Career' },
                        select: {
                            fullName: 1,
                            controlNumber: 1,
                            career: 1,
                            careerId: 1,
                            sex:1
                        }
                    }).populate({
                        path: 'periodId', model: 'Period',                   
                        select: {
                            periodName: 1,
                            active: 1,
                            year: 1,
                            _id: 1
                        }
                    })
                    .sort({ applicationDate: 1 })
                    .then(request=>resolve({request}));
                break;
            }
            default: {
                resolve(consultAllRequest());
            }
        }
    });
    
};

const getAllRequestApproved = (req, res) => {
    _request.find(
        { status: { $eq: 'Aprobado' } }
    ).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1
        }
    }).populate({
        path: 'periodId', model: 'Period',                   
        select: {
            periodName: 1,
            active: 1,
            year: 1,
            _id: 1
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
    }).populate({
        path: 'periodId', model: 'Period',                   
        select: {
            periodName: 1,
            active: 1,
            year: 1,
            _id: 1
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
    _request.findOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } }).then(
        async (request) => {            
            
            let updatedRequest;
            if (!request) {
                updatedRequest = await new Promise( (resolve)=>{
                    _request.updateOne({ _id: _id }, {
                    $set: {
                        status: eStatusRequest.PROCESS
                    },
                    $addToSet: {
                        documents:
                        {
                            type: data.Document, dateRegister: new Date(), nameFile: '', status: data.Status
                        }
                    }
                }).then(
                    (updated)=> _request.findOne({_id}).then( (filteredRequest)=>  resolve(filteredRequest ? filteredRequest : false) ).catch( err=>resolve(false))
                ).catch(
                    err=>resolve(false)
                )
                });
            } else {
                updatedRequest = await new Promise( (resolve)=>{
                    _request.updateOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
                    $set: {
                        "documents.$": { type: data.Document, dateRegister: new Date(), nameFile: '', status: data.Status }
                    }
                }).then(
                    (updated)=> _request.findOne({_id}).then( (filteredRequest)=>  resolve(filteredRequest ? filteredRequest : false) ).catch( err=>resolve(false))
                ).catch(
                    err=>resolve(false)
                )
                });                
            }
            
            
            if(updatedRequest){
                const result = updatedRequest.documents.filter(doc => doc.status === 'Accept' || doc.status === 'Omit');
                const doer = updatedRequest.history[updatedRequest.history.length-1];
                if (result.length === 14) {
                    _request.updateOne({ _id: _id }, {
                        $set: {                                    
                            phase: eRequest.VALIDATED,
                            status: eStatusRequest.NONE,
                            lastModified: new Date(),
                        },
                        $addToSet: {
                            history: {
                                phase: eRequest.DELIVERED,
                                achievementDate: new Date(),
                                doer: doer.doer,
                                observation: '',
                                status: eStatusRequest.ACCEPT
                            }
                        }
                    }).then(
                        (updated)=> {
                            _request.findOne({_id}).then( (filteredRequest)=>  res.status(status.OK).json({request:filteredRequest})).catch( err=> err=>res.status(status.BAD_REQUEST).json({err}))
                            
                        }
                    ).catch(
                        err=>res.status(status.BAD_REQUEST).json({err})
                    )
                }else{
                    res.status(status.OK).json({request:updatedRequest})
                }
            }else{
                return res.status(status.NOT_FOUND).json({err:'Request not found'});
            }
        }).catch(
            err=>res.status(status.BAD_REQUEST).json({err})
        );
};

/*

*/

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
            const docName = data.Document + path.extname((isJsPdf ? files.name : files.file.name));
            if (!request) {
                let result = await _Drive.uploadFile(req, eOperation.NEW, isJsPdf);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    let setQuery;
                    if (data.phase === eRequest.DELIVERED) {
                        setQuery = {
                            status: eStatusRequest.PROCESS,
                            phase: data.phase
                        };
                    } else {
                        setQuery = {
                            phase: data.phase
                        };
                    }
                    _request.update({ _id: _id }, {
                        $set: setQuery,
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
                const fileId = tmpDocument[0].driveId;
                req.body.fileId = fileId;
                let result = await _Drive.uploadFile(req, fileId ? eOperation.EDIT : eOperation.NEW, isJsPdf);
                if (typeof (result) !== 'undefined' && result.isCorrect) {
                    _request.update({
                        _id: _id,
                        documents: { $elemMatch: { type: data.Document } }
                    }, {
                        $set: {
                            status: (data.phase === eRequest.DELIVERED) ? eStatusRequest.PROCESS : request.status,
                            phase: data.phase,
                            'documents.$': {
                                type: data.Document, dateRegister: new Date(), nameFile: docName,
                                driveId: fileId ? tmpDocument[0].driveId : result.fileId,
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
        const extension = resource == 'xml' ? '.xml' : '.pdf';
        const mimeType = resource == 'xml' ? 'text/xml' : 'application/pdf';
        const tmpName = resource.toUpperCase() + "_" + _id + extension;
        let result = await _Drive.downloadToLocal(fileInformation.driveId, tmpName);

        if (typeof (result) !== 'undefined' && result) {
            console.log(`${__dirname}/../../documents/tmpFile/${tmpName}`);
            const fullPath = path.normalize(`${__dirname}/../../documents/tmpFile/${tmpName}`);
            res.set('Content-Type', mimeType);
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
    _request.updateOne({ _id: _id, documents: { $elemMatch: { type: data.Document } } }, {
        $set: {
            'documents.$.status': data.Status,
            'documents.$.observation': data.Observation
        }
    }).then ( (updated) => {
        _request.findOne({_id}).then(
            (request)=>{
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
                    _request.updateOne({ _id: _id }, {
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
                    }).then(
                        (updated)=>{
                            _request.findOne({_id}).then(
                                requestUpdated=> res.status(status.OK).json({request:requestUpdated}),
                                err=> res.status(status.NOT_FOUND).json({err})
                            ).catch( err=>res.status(status.BAD_REQUEST).json({err}))
                        }
                    );
                } else {
                    if (result.length > 14) {
                        console.log("es 20", result.length, result.length === 20);
                        if (result.length === 20) {
                            _request.updateOne({ _id: _id }, {
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
                            }).then(
                                (updated)=>{
                                    _request.findOne({_id}).then(
                                        requestUpdated=> res.status(status.OK).json({request:requestUpdated}),
                                        err=> res.status(status.NOT_FOUND).json({err})
                                    ).catch( err=>res.status(status.BAD_REQUEST).json({err}))
                                }
                            );
                        } else {
                            if (request.documents.length === 19) {
                                _request.updateOne({ _id: _id }, {
                                    $set: {
                                        status: eStatusRequest.PROCESS,
                                        lastModified: new Date(),
                                    }
                                }).then(
                                    (updated)=>{
                                        _request.findOne({_id}).then(
                                            requestUpdated=> res.status(status.OK).json({request:requestUpdated}),
                                            err=> res.status(status.NOT_FOUND).json({err})
                                        ).catch( err=>res.status(status.BAD_REQUEST).json({err}))
                                    }
                                );
                            } else {
                                var json = {};
                                json['request'] = request;
                                return res.status(status.OK).json(json);
                            }
                        }
                    }
                    else {
                        console.log(1);
                        
                        _request.updateOne({ _id: _id }, {
                            $set: {
                                phase: eRequest.DELIVERED,
                                status: eStatusRequest.PROCESS,
                                lastModified: new Date(),
                            },
                            $addToSet: {
                                history: {
                                    phase:eRequest.DELIVERED,
                                    achievementDate: new Date(),
                                    doer: typeof (data.Doer) !== 'undefined' ? data.Doer : '',
                                    observation: typeof (data.observation) !== 'undefined' ? data.observation : '',
                                    status: eStatusRequest.PROCESS
                                }
                            }
                        }).then(
                            (updated)=>{
                                _request.findOne({_id}).then(
                                    requestUpdated=> res.status(status.OK).json({request:requestUpdated}),
                                    err=> res.status(status.NOT_FOUND).json({err})
                                ).catch( err=>res.status(status.BAD_REQUEST).json({err}))
                            }
                        );
                        // var json = {};
                        // json['request'] = request;
                        // return res.status(status.OK).json(json);
                    }
                }
            },
            (err)=> res.status(status.BAD_REQUEST).json({err})
        ).catch(
            err=>res.status(status.BAD_REQUEST).json({err})
        );
        
    },
    err=>res.status(status.BAD_REQUEST).json({err})
    ).catch(
        err=>res.status(status.BAD_REQUEST).json({err})
    );
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
    const { _id,role } = req.params;
    let data = req.body;
    var subjectMail = '';
    var subtitleMail = '';
    var bodyMail = '';
    var observationsMail = '';
    let msnError = '';

    if (data.jurado) {
        for (let i = 0; i < data.jurado.length; i++){
            _employee.findOne({ email: data.jurado[i].email}, (err, employee) => {
                if(employee) {
                    data.jurado[i].genero = employee.gender;
                }
            });
        }
    }

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

        
        await _student.findOne({ _id: request.studentId}, (err, student) => {
            if(student) {
                data.genero = student.sex;
            }
        });

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
                    bodyMail = 'Su solicitud ha sido aceptada<br>'+
                    '<a href="https://drive.google.com/open?id=1fOItfyeVGiItdDHXvSNifvtABt6goe3I">Consultar hoja de requisitos</a><br>';
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
                        let generoP = data.jurado[0].genero === 'MASCULINO' ? 'Presidente' : data.jurado[0].genero === 'FEMENINO' ? 'Presidenta' : 'Presidente/a';
                        let generoS = data.jurado[1].genero === 'MASCULINO' ? 'Secretario' : data.jurado[1].genero === 'FEMENINO' ? 'Secretaria' : 'Secretaria/o';
                        let generoA = data.genero === 'M' ? 'del C.' : data.genero === 'F' ? 'de la C.' : 'de C.';

                        // Enviar correo  sinoidales
                        for(let i = 0; i < 4; i++){
                            if(data.jurado[i].email){
                                const subtitle =  data.jurado[i].genero === 'MASCULINO' ? 'Estimado '+data.jurado[i].name : data.jurado[0].genero === 'FEMENINO' ? 'Estimada '+data.jurado[i].name : 'Estimado/a '+data.jurado[i].name;
                                const body = 'Por este conducto le informo que el Acto de Recepción Profesional '+generoA+' <b>'+data.nombreAlumno+'</b> egresado del Instituto Tecnológico de Tepic, de la carrera de <b>'+data.carreraAlumno+'</b> por la opción de titulación de <b>'+data.opcionTitulacion+'</b> se realizará el día <b>'+data.fechaEvento+'</b>, a las <b>'+data.horaEvento+' Hrs.</b> En la sala <b>'+data.lugarEvento+'</b> de este Instituto.<br><br>Por lo que se le pide su puntual asistencia.<br><br>Integrantes del jurado<br>'+
                                '<ol style="text-align:left">'+
                                '<li><b>'+generoP+':</b>	'+data.jurado[0].name+'</li><br>'+
                                '<li><b>'+generoS+':</b>	'+data.jurado[1].name+'</li><br>'+
                                '<li><b>Vocal:</b>		'+data.jurado[2].name+'</li><br>'+
                                '<li><b>Vocal suplente:</b>	'+data.jurado[3].name+'</li><br>'+
                                '</ol>';
                                const email = data.jurado[i].email;
                                const subject = 'Acto recepcional - Aviso de titulación';
                                const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
                                const message = mailTemplateSinodales(subtitle, body);
                                await _sendEmail({ email: email, subject: subject, sender: sender, message: message }).then(
                                    result => {console.log("Correo enviado a: "+data.jurado[i].email);}
                                );
                                
                            }
                        }
                        // Enviar correo a jefe y srecretaria del departamento
                        for (let i = 0; i <2; i++) {
                            if(data.departamentoEmail[i].email){
                                const subtitle = '';
                                const body = 'Por este conducto le informo que el Acto de Recepción Profesional '+generoA+' <b>'+data.nombreAlumno+'</b> egresado del Instituto Tecnológico de Tepic, de la carrera de <b>'+data.carreraAlumno+'</b> por la opción de titulación de <b>'+data.opcionTitulacion+'</b> se realizará el día <b>'+data.fechaEvento+'</b>, a las <b>'+data.horaEvento+' Hrs.</b> En la sala <b>'+data.lugarEvento+'</b> de este Instituto.<br><br><br>Integrantes del jurado<br>'+
                                '<ol style="text-align:left">'+
                                '<li><b>'+generoP+':</b>	'+data.jurado[0].name+'</li><br>'+
                                '<li><b>'+generoS+':</b>	'+data.jurado[1].name+'</li><br>'+
                                '<li><b>Vocal:</b>		'+data.jurado[2].name+'</li><br>'+
                                '<li><b>Vocal suplente:</b>	'+data.jurado[3].name+'</li><br>'+
                                '</ol>';
                                const email = data.departamentoEmail[i].email;
                                const subject = 'Acto recepcional - Aviso de titulación';
                                const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
                                const message = mailTemplateSinodales(subtitle, body);
                                await _sendEmail({ email: email, subject: subject, sender: sender, message: message }).then(
                                    result => {console.log("Correo enviado a: "+data.departamentoEmail[i].email);}
                                ).catch(err => {
                                    console.log("Error al enviar correo enviado a: "+data.departamentoEmail[i].email);
                                });
                            }
                        }

                        subjectMail = 'Acto recepcional - Confirmación de fecha de titulación';
                        subtitleMail = 'Confirmación de fecha de titulación';
                        bodyMail = 'Tu acto recepcional se realizará el día <b>'+data.fechaEvento+'</b>, a las <b>'+data.horaEvento+' Hrs.</b> En la sala <b>'+data.lugarEvento+'</b> de este Instituto.<br><br>'+
                        'Integrantes del jurado'+
                        '<ol style="text-align:left">'+
                        '<li><b>'+generoP+':</b>	'+data.jurado[0].name+'</li><br>'+
                        '<li><b>'+generoS+':</b>	'+data.jurado[1].name+'</li><br>'+
                        '<li><b>Vocal:</b>		'+data.jurado[2].name+'</li><br>'+
                        '<li><b>Vocal suplente:</b>	'+data.jurado[3].name+'</li><br>'+
                        '</ol>';
                        request.phase = eRequest.REALIZED;
                        request.status = eStatusRequest.NONE;
                        item.status = eStatusRequest.ACCEPT;
                        break;
                    }
                    case eStatusRequest.REJECT: {
                        subjectMail = 'Acto recepcional - Confirmación de fecha de titulación';
                        subtitleMail = 'Confirmación de fecha de titulación';
                        // bodyMail = 'Tu fecha solicitada ha sido rechazada, favor de ingresar al sistema para elegir una nueva fecha.';
                        bodyMail = 'Tu fecha solicitada ha sido rechazada.';
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
                        req.body.Document = eFile.OFICIO;
                        let isUploadFile = await _Drive.uploadFile(req, eOperation.NEW, true);
                        if (typeof (isUploadFile) !== 'undefined' && isUploadFile.isCorrect) {
                            request.documents.push({
                                type: eFile.OFICIO, dateRegister: new Date(), nameFile: eFile.OFICIO, status: 'Accept', driveId: isUploadFile.fileId
                            });
                        }
                        else {
                            msnError = 'Archivo no cargado';
                        }
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
                        await updateStudentDegreeInSII(request.titulationOption.split(' ')[0],data.controlNumber,request.proposedDate);
                        await updateStudentStatus('TIT',request.studentId);
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
                        // subjectMail = 'Acto recepcional - Acta de examen profesional';
                        // subtitleMail = 'Acta de examen profesional';
                        // bodyMail = 'Su acta ha sido entregada';
                        // observationsMail = item.observation;
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
            request.save( async (errorReq, response) => {
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
                if(role){
                    const request = await consultRequestByStatus(role);
                    _socket.broadcastEmit(eSocket.recActEvents.REQUEST_BY_ROLE,request); 
                }
                _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{cancelTitulation:true});//solo para el calendario
                return res.status(status.OK).json(json);
            });
        }
    });
};

const updateStudentDegreeInSII = (titulationOption, controlNumber,actRectDate)=>{
    const date = moment(new Date(actRectDate)).format('YYYY-MM-DD');    
    
    const dataStudent = JSON.stringify({
        option:titulationOption,
        date
    });    
    var optionsPost = {
        "rejectUnauthorized": false,
        host: 'wsescolares.tepic.tecnm.mx',
        port: 443,
        path: `/alumnos/update/${controlNumber}`,
        // authentication headers     
        method: 'PUT',
        headers: {
            'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64'),
            'Content-Type': 'application/json',
            'Content-Length': dataStudent.length
        }

    };
    return new Promise( (resolve)=>{
        const request = https.request(optionsPost, (postApi) => {
            var response = "";
            postApi.on('data', async (d) => {
                response += d;
            });
            postApi.on('end', async () => {
                response = JSON.parse(response);
                if (response.error) {
                    resolve(false);
                }           
                console.log(response);                
                resolve(true);
            });
        });
        request.on('error', (error) => {
            resolve(false);
        });

        request.write(dataStudent);
        request.end();
    });
};

const updateStudentStatus = (studentStatus, _id) => {
    return new Promise( (resolve) => {
        _student.updateOne({_id},{$set:{status:studentStatus}})
            .then( (updated) => resolve(true) )
            .catch( (err) => resolve(false) );
    } );
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

const groupDiary = async (req, res) => {
    let data = req.body;
    const diary = await consultDiary(data);
    if(diary.error){
        return res.status(status.BAD_REQUEST).json(diary.error);
    }
    _socket.singleEmit(eSocket.recActEvents.GET_DIARY,diary,req.params.clientId);
    res.status(status.OK).json({sendBySocket:true});
};
const consultDiary = (data)=>{
    return new Promise((resolve)=>{
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
                                jury: '$jury', place: '$place', project: '$projectName', duration: '$duration', product: '$product', option: '$titulationOption',status: "$status"
                            }
                        }
                    }
                }
            ];
        _request.aggregate(query, async (error, diary) => {
            if (error)
                return resolve({ error });
            
            const denyDays = await _DenyDays.get();
            resolve({ Diary: diary, denyDays });            
        });
    });
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
                        { "phase": "Asignado", "status": "Process" },
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
        .aggregate(query, async (error, schedule) => {
            if (error)
                return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
            const denyDays = await _DenyDays.get();
            res.status(status.OK).json({ Schedule: schedule, denyDays });
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

const updateRequestPeriod = (_id,periodId)=>{
    return new Promise((resolve)=>{
        _request.updateOne({_id},{$set:{
            periodId
        }}).then(
            updated=>resolve({ok:true}),
            err=> resolve({err})
        ).catch(err=>resolve({err}))
    });
};
const period = async (req,res)=>{    
    const periodId = await getActivePeriod();
    // console.log(periodId);
    
    _request.find({periodId:{$exists:false}}).then(
        async (requests)=>{
            if(requests){
                // console.log(requests);             
                for (const request of requests){
                    const updated = await updateRequestPeriod(request._id,periodId._id);
                    console.log(updated);
                }
                return res.status(status.OK).json({requestId:requests});
            }
        }
    );        
};
const getPeriods = (req,res)=>{
    _period.find({},{_id:1,periodName:1,year:1,active:1}).sort({code:-1}).limit(10).then(
        (periods)=>{
            res.status(status.OK).json({periods})
        }
    );
};


const getStudent = (_id)=>{
    return new Promise((resolve)=>{
        _student.findOne({_id})
        .populate({
            path: 'careerId', model: 'Career',
            select: {
                fullName: 1, shortName: 1, acronym: 1
            }
        })  
        .then(
            (st)=>{
                if(st){
                 return  resolve(st);
                }
                return resolve(false);
            },
            err=>resolve(false)
        ).catch(err=>resolve(false));
    });
};

const getDepartmentBoss = (acronym)=>{
    
    return new Promise( async (resolve) => {
        const departments = await _Departments.consultAll(acronym ? acronym :'');
        if(departments.err){
            return resolve(false);
        }
        return resolve({boss:departments[0].boss.name.fullName,name:departments[0].name});        
    } );
    
};

const completeTitledRequest =  (req,res) => {    
    _request.find({$and:[ {isIntegral:false},{adviser:{$exists:false}}]}).then(
        (requests)=>{
            if(requests){
                requests.forEach( async (rq) =>{
                    const tmpReq = rq;
                    const student = await getStudent(rq.studentId);
                    const acronym = student.careerId.acronym;
                    tmpReq.department = await getDepartmentBoss(acronym);
                    tmpReq.grade = await _getGradeName(rq.studentId);
                    tmpReq.adviser = {
                        name: rq.jury[0].name,
                        title: rq.jury[0].title,
                        cedula: rq.jury[0].cedula
                    };
                    tmpReq.email = student.email;
                    tmpReq.telephone = student.phone;
                    tmpReq.noIntegrants = 1;
                    tmpReq.doer = 'ANA GUADALUPE RAMÍREZ LÓPEZ';
                    await new Promise ((resolve)=>{
                        _request.updateOne({_id:rq._id},{$set:tmpReq}).then(
                            updated=>resolve(true),
                            err=>resolve(err)
                        );
                    }); 
                                        
                });
                return res.status(status.OK)
                    .json({ msg:'Tarea completada' });
            }
            return res.status(status.OK)
                .json({ msg:'No hay solicitudes' });
        }
    );
    
};
const getEmployeeGender = (req,res)=>{
    const {email} = req.params;    
    
    _employee.findOne( {$or:[{email},{"name.fullName":email}]}).then(
        (emp)=>{                        
            if(emp){
                return res.status(status.OK).json({gender:emp.gender});
            }
            return res.status(status.NOT_FOUND).json({msg:'Usuario no encontrado'});
        },
        err=>res.status(status.BAD_REQUEST).json({err})
    ).catch( 
        err=> res.status(status.BAD_REQUEST).json({err})
        );
};

const getEmployeeGradeAndGender = (req,res)=>{
    const {email} = req.params;    
    
    _employee.findOne( {$or:[{email},{"name.fullName":email}]}).then(
        (emp)=>{                        
            if(emp){
                return res.status(status.OK).json({gender:emp.gender,grade:emp.grade.reverse()[0].abbreviation});
            }
            return res.status(status.NOT_FOUND).json({msg:'Usuario no encontrado'});
        }
    ).catch( 
        err=> res.status(status.BAD_REQUEST).json({err})
        );
};

const getSummary = (req,res)=>{
    _request.find({$or:[{phase:'Generado'},{phase:'Titulado'}]},{email:1,studentId:1,titulationOption:1,product:1,proposedDate:1,proposedHour:1}).
    populate({
        path: 'studentId', model: 'Student',        
        populate: { path: 'folderIdRecAct', model: 'Folder', select:{idFolderInDrive:1}},
        select: {            
            folderIdRecAct:1
        }
    }).populate({path: 'studentId', model: 'Student', populate: { path: 'careerId', model: 'Career', select: {fullName:1,acronym:1}},select: {careerId:1,fullName: 1,
        controlNumber: 1,            
        documents:1}})
    .then(
       async (requests)=>{           
           
            if(requests){
                
                const mapedRequests = await Promise.all( 
                    requests.map(
                    async request => {
                        const notSaved = request.studentId.documents ? request.studentId.documents.filter(doc=> doc.type === 'ACTOREC').length === 0: true;
                        if(notSaved){
                            if(request.email){
                                const id = request._id;
                                const proposedDate = request.proposedDate;
                                const proposedHour = request.proposedHour;
                                const titulationOption = request.titulationOption;                               
                                const product = request.product;                                                                                               
                                let student = {
                                    fullName: request.studentId.fullName,
                                    controlNumber : request.studentId.controlNumber,
                                    career: request.studentId.careerId.fullName,
                                    careerAcronym: request.studentId.careerId.acronym,
                                    email: request.email+'',
                                    folderDriveIdRecAct: request.studentId.folderIdRecAct.idFolderInDrive,
                                    _id:request.studentId._id
                                };                                  
                                student.emailQr = await QRCode.toDataURL(student.email);
                                                
                                return {id,proposedDate,proposedHour,titulationOption,product,student};
                            }
                        }                            
                    })
                );
                const filteredRequest = mapedRequests.filter( _req=>_req);
                if(filteredRequest.length == 0)
                    return res.status(status.NOT_FOUND).json({msg:'No hay solicitudes'});
                return res.status(status.OK).json(filteredRequest);
            }else{
                return res.status(status.NOT_FOUND).json({err:'No hay solicitudes'});
            }
        },
        err=>console.log(err)
        
    ).catch(err=> {
        console.log(err);
        res.status(status.BAD_REQUEST).json({err});
    });
};

const uploadSummary = async (req,res)=>{    
    const summaries = req.body;
    const result = await Promise.all(  
        summaries.map(
            async (summary)=>{
                const result = await _Drive.uploadFile({body:summary}, eOperation.NEW, true);
                if(result.isCorrect){
                    _student.updateOne({_id:summary.studentId},{$push:{documents:{type:"ACTOREC",filename:summary.file.name,fileIdInDrive:result.fileId}}}).then(up=>{},err=>{}).catch(err=>{});
                }
                return result;
            }
        )
    );
    const resStatus = result.filter( up=> up.isCorrect ).length > 0 ? status.OK : status.BAD_REQUEST; 
    return res.status(resStatus).json(result);
    // const result = await _Drive.uploadFile(req, eOperation.NEW, true);
};

const createStatusExamAct = (req, res) => {
    const {_idRequest} = req.params;
    const doc = req.body;
    // Actualizar la solicitud
    _request.updateOne({_id: _idRequest}, {$set: {examActStatus: doc.status}})
      .then(updated => {
        if (updated.nModified) {
          return res.status(status.OK).json({message: 'Solicitud actualizada con exito'});
        }
        return res.status(status.NOT_FOUND).json({error: 'No se encontró la solicitud'});
      })
      .catch(_ => {
        res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al actualizar la solicitud'});
      })
  };

  const sendMailExamAct = (req, res) => {
    const _email = req.body.to_email;
    const _status = req.body.status;

    const subtitle = 'Acta de examen profesional';
    const body = _status ? 'Su acta ha sido entregada' : 'Su acta está pendiente de entrega' ;
    const email = _email;
    const subject = 'Acto recepcional - Acta de examen profesional';
    const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
    const message = mailTemplate(subtitle, body, '');
    _sendEmail({ email: email, subject: subject, sender: sender, message: message })
    .then(async data => {
        if (data.code === 202) {
            res.status(status.OK).json({ message: 'Correo envíado con éxito' })
        } else {
            res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'Error al envíar el correo' });
        }
    })
  }

  const changeStatusExamAct = (req, res) => {
    const {_idRequest} = req.params;
    const doc = req.body;

    _request.updateOne({ _id: _idRequest},{examActStatus: doc.status})
    .then(updated => {
        if (updated.nModified) {
          return res.status(status.OK).json({message: 'Solicitud actualizada con exito'});
        }
        return res.status(status.NOT_FOUND).json({error: 'No se encontró la solicitud'});
      })
      .catch(_ => {
        res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al actualizar la solicitud'});
      })
  };
  const getActivePeriod = () => {

    return new Promise(async (resolve) => {
        await _period.findOne({ active: true }, (err, period) => {


            if (!err && period) {
                resolve(period);
            } else {
                resolve(false);
            }
        });
    });
};

module.exports = (Request, DenyDay, Folder, Student, Period,Department, Employee, Position) => {
    _request = Request;
    _DenyDays = require('./denyDays.controller')(DenyDay);
    _Drive = require('../app/google-drive.controller')(Folder);
    _Departments = require('../shared/department.controller')(Department, Employee, Position);
    _employee = Employee;
    _student = Student;
    _period = Period;
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
        changeJury,
        period,
        getPeriods,
        completeTitledRequest,
        getEmployeeGender,
        getEmployeeGradeAndGender,
        getSummary,
        uploadSummary,
        createStatusExamAct,
        sendMailExamAct,
        changeStatusExamAct
    });
};
