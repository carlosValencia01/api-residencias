const handler = require('../../utils/handler');
const status = require('http-status');
const sendMail = require('../shared/mail.controller');
const mailTemplate = require('../../templates/verifyCodeControlStudent');
const mongoose = require('mongoose');

let _controlStudent;
let _student;

const getAll = (req, res) => {
    _controlStudent.find({})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .exec(handler.handleMany.bind(null, 'controlStudents', res));
};

const getControlStudentByDocumentAndStatus = (req, res) => {
    const { document, eStatus } = req.params;
    if (!['solicitude', 'presentation', 'acceptance'].includes(document)) {
        return res.status(status.EXPECTATION_FAILED).json({
            error: 'No hay estudiantes para el documento buscado'
        });
    }
    let query = {};
    if (document === 'presentation') {
        query = {
            'verification.solicitude': 'approved'
        }
    }
    query['verification.' + document] = { $in: eStatus.split('-') };
    _controlStudent.find(query)
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .select('-documents')
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ controlStudent: data })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe información de los estudiantes buscados' })
            }
        })
        .catch( err => {
            return res.status(status.BAD_REQUEST).json({ error: err.toString() });
        })
};

const getControlStudentById = (req, res) => {
    const { _id } = req.params;
    _controlStudent.findOne({_id: _id})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1, sex: 1,
                semester: 1, controlNumber: 1, phone: 1, street: 1, suburb: 1, folderIdSocService: 1 },
                populate: {path: 'folderIdSocService', model: 'Folder', select: {idFolderInDrive: 1}} })
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ controlStudent: data })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
        return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getControlStudentByGeneralStatus = (req, res) => {
    const { eStatus } = req.params;
    _controlStudent.find({ status: eStatus })
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ controlStudents: data })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
        return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getControlStudentByNotEqualGeneralStatus = (req, res) => {
    const { eStatus } = req.params;
    _controlStudent.find({ status: { $ne: eStatus } })
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ controlStudents: data })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
        return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getControlStudentByStudentId = (req, res) => {
    const { studentId } = req.params;
    _controlStudent.findOne({studentId: studentId})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1, sex: 1,
                semester: 1, controlNumber: 1, phone: 1, street: 1, suburb: 1 }})
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ controlStudent: data })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
            return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getStudentInformationByControlId = (req, res) => {
    const { _id } = req.params;
    _controlStudent.findOne({_id: _id})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1, sex: 1,
                 semester: 1, controlNumber: 1, phone: 1, street: 1, suburb: 1 }})
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ student: data.studentId })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
        return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getFullStudentInformationByControlId = (req, res) => {
    const { _id } = req.params;
    _controlStudent.findOne({_id: _id})
        .populate({path: 'studentId', model: 'Student', select: {}})
        .then( data => {
            if(data) {
                return res.status(status.OK).json({ student: data.studentId })
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        }).catch( err => {
        return res.status(status.BAD_REQUEST).json({ error: err.toString() });
    });
};

const getRequests = (req, res) => {
    const { status } = req.params;
    if (status === 'send') {
        _controlStudent.find({"verification.solicitude": "send"})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .exec(handler.handleMany.bind(null, 'controlStudents', res));
        return;
    }
    if (status == 'approved'){
        _controlStudent.find({"verification.solicitude": "approved"})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .exec(handler.handleMany.bind(null, 'controlStudents', res));
        return;
    }
    if (status == 'all'){
        _controlStudent.find({"verification.solicitude": {$in:["send","approved","reevaluate"]}})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .exec(handler.handleMany.bind(null, 'controlStudents', res));
    }
    return;
}


const createAssistanceByControlNumber = (req, res) => {
    const data = req.body;
    _student.findOne({controlNumber: data.controlNumber})
        .then(student => {
            if (student) {
                data._id = student._id;
                _controlStudent.findOne({controlNumber: data.controlNumber})
                    .then( control => {
                        if (control) {
                            return res.status(status.NOT_FOUND).json({ msg: 'La asistencia del estudiante ya se encuentra registrada' })
                        } else {
                            _controlStudent.create({studentId: data._id, controlNumber: data.controlNumber, releaseAssistanceDate: new Date()})
                                .then( () => {
                                    return res.status(status.OK).json({ msg: 'Se ha registrado la asistencia del alumno correctamente' });
                                }).catch( err => {
                                    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                            });
                        }
                    }).catch( err => {
                    return res.status(status.BAD_REQUEST).json({ error: err.toString() });
                });
            } else {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
            }
        })
        .catch(_ => {
            return res.status(status.BAD_REQUEST).json({ error: err.toString() });
        });
};

const sendCodeForEmailConfirmation = (req, res) => {
    const { _id, email } = req.params;
    const code = _generateVerificationCode(6);

    _controlStudent.findOne({_id: _id}, {}, (err, data) => {
       if (err) {
           return res.status(status.BAD_REQUEST).json({ error: err.toString() });
       } else {
           if (data) {
               _controlStudent.updateOne({_id: _id}, { $set: { 'verification.code': code, 'emailStudent': email } })
                   .then( () => {
                       const emailData = {
                           email: email,
                           subject: 'Servicio social - Verificación de correo electrónico',
                           sender: 'Instituto Tecnológico de Tepic <serviciosocial@ittepic.edu.mx>',
                           message: mailTemplate(code)
                       };
                       _sendEmail(emailData)
                           .then(async data => {
                               if (data.code === 202) {
                                   await _updateSentVerificationCode(_id, true);
                                   return res.status(status.OK).json({ error: false, msg: 'Se ha enviado el correo'})
                               } else {
                                   await _updateSentVerificationCode(_id, false);
                                   return res.status(status.OK)
                                       .json({
                                           code: status.INTERNAL_SERVER_ERROR,
                                           msg: 'Error al envíar el correo, volver de intentarlo mas tarde',
                                           error: true
                                       });
                               }
                           });
                   }).catch( err => {
                   return res.status(status.BAD_REQUEST).json({ error: err.toString(), msg: 'No sabemos que ha sucedido, vuelva a intentarlo mas tarde' });
               });
           } else {
               return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
           }
       }
    });
};

const verifyCode = (req, res) => {
    const { _id, code } = req.body;

    _controlStudent.findOne({ _id: _id })
        .then(student => {
            if (student.verification.code === parseInt(code)) {
                _controlStudent.updateOne({ _id: _id },
                    { $set: { 'verification.verificationEmail': true } })
                    .then(_ => res.status(status.OK).json({ msg: 'Correo verificado' }))
                    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ msg: 'Error al verificar código' }))
            } else {
                res.status(status.INTERNAL_SERVER_ERROR)
                    .json({ msg: 'Código incorrecto' });
            }
        })
        .catch(_ => {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ msg: 'Error al verificar código' });
        });
};


const addOneReportToStudent = (req, res) => {
    const { _id } = req.params;
    _controlStudent.findOne({_id: _id})
        .then( student => {
            const newPosition = student.verification.reports.length + 1;
            const newPositionManager = student.verification.managerEvaluations.length + 1;
            const newPositionSelf = student.verification.selfEvaluations.length + 1;
            if (newPosition > 12) {
                return res.status(status.BAD_REQUEST).json({ msg: 'Número máximo de reportes, por favor de verificar', error});
            }
            const newReport = {
                position: newPosition,
                name: 'ITT-POC-08-06-0'+newPosition,
                status: 'register'
            };
            const newManagerEval = {
                position: newPositionManager,
                name: 'ITT-POC-08-06-0'+newPositionManager,
                status: 'register'
            };
            const newSelfEval = {
                position: newPositionSelf,
                name: 'ITT-POC-08-06-0'+newPositionSelf,
                status: 'register'
            };
            _controlStudent.updateOne({_id: _id}, { $push: {
                'verification.reports': newReport,
                'verification.managerEvaluations': newManagerEval,
                'verification.selfEvaluations': newSelfEval,
            }})
                .then( updated => {
                    return res.status(status.OK).json({ msg: 'Se ha agregado un nuevo reporte junto sus respectivas cartas de evaluación', updated})
                }).catch(error => {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ msg: 'Error al agregar el reporte', error});
            });
        }).catch( err => {
            return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
    });
};

const removeOneReportToStudent = (req, res) => {
    const { _id } = req.params;
    _controlStudent.findOne({_id: _id})
        .then( student => {
            const newPosition = student.verification.reports.length;
            if (newPosition === 3) {
                return res.status(status.BAD_REQUEST).json({ msg: 'Número mínimo de reportes, por favor de verificar'});
            }
            _controlStudent.updateOne({_id: _id}, { $pop: { 'verification.reports': 1, 'verification.managerEvaluations': 1, 'verification.selfEvaluations': 1}})
                .then( updated => {
                    return res.status(status.OK).json({ msg: 'Se ha removido un reporte correctamente', updated})
                }).catch(error => {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ msg: 'Error al remover el reporte', error});
            });
        }).catch( err => {
        return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
    });
};

const releaseSocialServiceAssistanceCsv = (req, res) => {
    const students = req.body;
    const findStudent = (data) => {
        return _student.findOne({controlNumber: data.controlNumber})
            .then(student => {
                if (student) {
                    data._id = student._id;
                    data.exists = true;
                    data.created = false;
                    return data;
                } else {
                    data.exists = false;
                    data.created = false;
                    return data;
                }
            })
            .catch(_ => {
                data.exists = false;
                return data;
            });
    };
    const releaseAssistance = (data) => {
        if (data.exists) {
            _controlStudent.findOne({controlNumber: data.controlNumber})
                .then(student => {
                    if (student) {
                        return _controlStudent.updateOne({_id: student._id}, {$set: { 'verification.assistance': true }});
                    }
                    return _controlStudent.create({
                        studentId: data._id,
                        controlNumber: data.controlNumber,
                        releaseAssistanceDate: new Date(),
                        'verification.reports': [
                            {position: 1, name: 'ITT-POC-08-06-01'},
                            {position: 2, name: 'ITT-POC-08-06-02'},
                            {position: 3, name: 'ITT-POC-08-06-03'}
                        ],
                        'verification.managerEvaluations': [
                            {position: 1, name: 'ITT-POC-08-09-01'},
                            {position: 2, name: 'ITT-POC-08-09-02'},
                            {position: 3, name: 'ITT-POC-08-09-03'}
                        ],
                        'verification.selfEvaluations': [
                            {position: 1, name: 'ITT-POC-08-11-01'},
                            {position: 2, name: 'ITT-POC-08-11-02'},
                            {position: 3, name: 'ITT-POC-08-11-03'}
                        ],
                    });
                });
        }
    };

    const actions = students.map(findStudent);
    const results = Promise.all(actions);

    results.then(data => {
        return Promise.all(data.map(releaseAssistance));
    });

    results
        .then((data) => {
            return res.status(status.OK).json({ 'data': data });
        })
        .catch((error) => {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error });
        });
}

const updateGeneralControlStudent = (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  _controlStudent.updateOne({_id: id}, { $set: newData })
      .then( () => {
          return res.status(status.OK).json({ msg: 'Información guardada correctamente' });
      }).catch( err => {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
  });
};

const updateReportFromDepartmentEvaluation = (req, res) => {
    const { _id } = req.params;
    const { nameDocument, documentId, eStatus } = req.body;

    _controlStudent.updateOne({_id: _id, ['verification.'+nameDocument]: { $elemMatch: { _id: documentId } }}, { $set: { ['verification.' + nameDocument + '.$.status']: eStatus } })
        .then( updated => {
            return res.status(status.OK).json({ msg: 'Reporte actualizado correctamente', updated});
        }).catch( err => {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
    });
};

const updateDocumentEvaluationFromDepartmentEvaluation = (req, res) => {
    const { _id } = req.params;
    const { documentId, eStatus, documentDepartment, nameDocument } = req.body;
    // nameDocument puede ser reports, managerEvaluations o selfEvaluations
    _controlStudent.updateOne({_id: _id, ['verification.' + nameDocument]: { $elemMatch: { _id: documentId } }}, { $set: { ['verification.' + nameDocument + '.$.status']: eStatus } })
        .then( () => {
            // return res.status(status.OK).json({ msg: 'Evaluación actualizada correctamente', updated});
            _controlStudent.findOne({_id: _id})
                .then(student => {
                    const validation = student.verificationDepartment[nameDocument].find(r => r.filename === documentDepartment.filename);
                    if (validation) {
                        _controlStudent.updateOne({_id: _id, ['verificationDepartment.' + nameDocument]: { $elemMatch: { _id: validation._id } }}, { $set: { ['verificationDepartment.' + nameDocument + '.$.validation']: documentDepartment.validation, ['verificationDepartment.' + nameDocument + '.$.message']: documentDepartment.message } })
                            .then( updated => {
                                return res.status(status.OK).json({ msg: 'Se ha actualizado la evaluación', updated});
                            }).catch( err => {
                            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
                        });
                    } else {
                        _controlStudent.updateOne({_id: _id}, { $push: { ['verificationDepartment.' + nameDocument]: documentDepartment }})
                            .then( updated => {
                                return res.status(status.OK).json({ msg: 'Se ha guardado la evaluación', updated})
                            }).catch(error => {
                            return res.status(status.INTERNAL_SERVER_ERROR).json({ msg: 'Error al guardar la evaluación el reporte', error});
                        });
                    }
                }).catch(err => {
                return res.status(status.NOT_FOUND).json({ msg: 'No existe información de los estudiantes buscados', err})
            });
        }).catch( err => {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
    });
};

const createHistoryDocumentStatus = (req, res) => {
    const { id } = req.params;
    const history = req.body;
    _controlStudent.findOne({_id: id})
        .then(student => {
            const founded = student.historyDocumentStatus.find(h => h.name === history.name);
            if (founded) {
                return res.status(status.BAD_REQUEST).json({ msg: 'El registro ya ha sido creado' })
            } else {
                _controlStudent.updateOne({_id: id}, { $push: { historyDocumentStatus: history }})
                    .then( () => {
                        return res.status(status.OK).json({ msg: 'Se ha creado el historico del documento' })
                    })
                    .catch(err => {
                        return res.status(status.NOT_FOUND).json({ msg: 'No se ha creado el historico del documento', error: err })
                    });
            }
        }).catch(() => {
            return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
        });
};

const pushHistoryDocumentStatus = (req, res) => {
    const { id, documentId } = req.params;
    const eStatus = req.body;
    console.log(id, documentId);
    _controlStudent.updateOne({_id: id, historyDocumentStatus: { $elemMatch: { _id: documentId } } }, { $push: { 'historyDocumentStatus.$.status': eStatus } })
        .then( () => {
            return res.status(status.OK).json({ msg: 'Se ha guardado registro en historico del documento' })
        }).catch(() => {
        return res.status(status.NOT_FOUND).json({ msg: 'No existe el estudiante buscado' })
    });
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

const _generateVerificationCode = (length) => {
    let number = '';
    while (number.length < length) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
};

const _updateSentVerificationCode = (_id, status) => {
    return new Promise(resolve => {
        _controlStudent.updateOne({ _id: _id }, { $set: { "verification.sendEmailCode" : status } })
            .then(_ => resolve(true))
            .catch(_ => resolve(false));
    });
};

const assignDocumentDrive = (req, res) => {
    const { _id } = req.params;
    const _doc = req.body.doc;
    const status = req.body.status;

    const push = { $push: { documents: _doc } };

    _controlStudent.updateOne({ _id: _id }, push)
        .then(
            async (doc) => {
                let statusChanged = await updateDocumentStatus(_id, _doc.filename, status);
                if (statusChanged) {
                    res.status(200).json({ document: doc });
                } else {
                    res.status(404).json({ error: 'Status without changes' });
                }
            }
        ).catch(err => {
            res.status(404).json({
                error: err,
                action: 'get documents'
            });
    });
};

async function updateDocumentStatus(_id, docName, status) {

    const docid = await getActiveStatus(_id, docName);
    if (docid && docid[0]) {

        const result = docid[0];
        const doc_id = result.documents[0]._id;

        if ((result.documents[0].status)) {
            if (result.documents[0].status.length === 0) {//no hay estatus activo
                return await _controlStudent.updateOne(
                    {
                        _id: _id,
                        'documents._id': doc_id
                    },
                    { $push: { 'documents.$.status': status } }
                )
                    .then(
                        doc => {
                            return true;
                        }
                    ).catch(err => { return false; });
            } else {
                return await _controlStudent.updateOne( //cambiar active = false
                    {
                        _id: _id,
                        documents: {
                            "$elemMatch": { _id: doc_id, "status.active": true }
                        }
                    },
                    {
                        "$set": {
                            "documents.$[outer].status.$[inner].active": false,
                        }
                    },
                    {
                        "arrayFilters": [
                            { "outer._id": doc_id },
                            { "inner.active": true }
                        ]
                    }
                )
                    .then(
                        async doc => {

                            return await _controlStudent.updateOne(
                                {
                                    '_id': _id,
                                    'documents._id': doc_id
                                },
                                { $push: { 'documents.$.status': status } },
                                { new: true }
                            )
                                .then(
                                    doc => {
                                        return true;
                                    }
                                ).catch(err => { return false; });
                        }
                    ).catch(err => { return false; });
            }


        } else { //no existe estatus

            return await _controlStudent.updateOne(
                {
                    _id: _id,
                    'documents._id': doc_id
                },
                { $push: { 'documents.$.status': status } },
                { new: true }
            )
                .then(
                    doc => {
                        return true;
                    }
                ).catch(err => { return false; });
        }
    } else {
        return false;
    }
}

async function getActiveStatus(_id, filename) {
    let id = mongoose.Types.ObjectId(_id);
    return await _controlStudent.aggregate([
        {
            "$match": {
                "_id": id
            }
        },
        {
            "$project": {
                "documents": {
                    "$filter": {
                        "input": {
                            "$map": {
                                "input": "$documents",
                                "as": "docs",
                                "in": {
                                    "$cond": [
                                        { "$eq": ["$$docs.filename", filename] },
                                        {
                                            "filename": "$$docs.filename",
                                            "_id": "$$docs._id",
                                            "status": {
                                                "$filter": {
                                                    "input": "$$docs.status",
                                                    "as": "status",
                                                    "cond": { "$eq": ["$$status.active", true] }
                                                }
                                            }
                                        },
                                        false
                                    ]
                                }
                            }
                        },
                        "as": "cls",
                        "cond": "$$cls"
                    }

                }
            }
        }]).then(docm => {
        // console.log('2', docm);

        return docm;

    }).catch(err => {
        return false;
    });
}

const updateDocumentLog = async (req, res) => {
    const { _id } = req.params;
    const { filename, status } = req.body;
    let statusChanged = await updateDocumentStatus(_id, filename, status);
    // validate stepwizard
    // if(filename.includes('SOLCIITUD')){
    //     await new Promise((resolve)=>{
    //
    //         _student.findOne({controlNumber: filename.split('-')[0]},{documents:1, status:1}).then(student => {
    //
    //             const validatedDocs = student.documents.filter( (doc)=> doc.status.length > 0 ? doc.status[doc.status.length-1].name === 'VALIDADO' && (doc.filename.indexOf('SOLICITUD') > -1) : false).length;
    //
    //             const aceptedDocs = student.documents.filter( (doc)=> doc.status.length > 0 ? doc.status[doc.status.length-1].name === 'ACEPTADO' && (doc.filename.indexOf('COMPROBANTE') > -1) : false).length;
    //
    //             if(((validatedDocs + aceptedDocs) == 2 || (validatedDocs + aceptedDocs) == 3)){
    //
    //                 let query = { status: 'confirm', stepWizard: 2 };
    //
    //                 _controlStudent.updateOne({_id:student._id},query).then(ok=>resolve(true)).catch(_=>resolve(false));
    //             }
    //             resolve(true);
    //         });
    //     });
    // }

    if (statusChanged) {
        res.status(200).json({ action: "Status updated" });
    } else {
        res.status(404).json({ error: 'Status without changes' });
    }
};


module.exports = (ControlStudent, Student) => {
    _controlStudent = ControlStudent;
    _student = Student;

    return ({
        getAll,
        getControlStudentByDocumentAndStatus,
        getControlStudentById,
        getControlStudentByGeneralStatus,
        getControlStudentByNotEqualGeneralStatus,
        getControlStudentByStudentId,
        getStudentInformationByControlId,
        getFullStudentInformationByControlId,
        getRequests,
        verifyCode,
        addOneReportToStudent,
        removeOneReportToStudent,
        createAssistanceByControlNumber,
        sendCodeForEmailConfirmation,
        releaseSocialServiceAssistanceCsv,
        updateGeneralControlStudent,
        assignDocumentDrive,
        updateDocumentLog,
        updateReportFromDepartmentEvaluation,
        updateDocumentEvaluationFromDepartmentEvaluation,
        createHistoryDocumentStatus,
        pushHistoryDocumentStatus
    });
};
