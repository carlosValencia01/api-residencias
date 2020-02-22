const handler = require('../../utils/handler');
const status = require('http-status');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
const superagent = require('superagent');
const mongoose = require('mongoose');
var https = require('https');
const { eInsFiles} = require('../../enumerators/reception-act/enums');

let _student;
let _request;
let _role;
let _period;

const getAll = (req, res) => {
    _student.find({})
        .exec(handler.handleMany.bind(null, 'students', res));
};

const getStudentsInscription = (req, res) => {
    _student.find({ "inscriptionStatus": { $exists: true } }).then(
        students => {
            const mapedDocs = mapDocuments(student.documents);
            const newStudents = students.map(student => ({
                "_id": student._id,
                "fullName": student.fullName,
                "controlNumber": student.controlNumber,
                "nip": student.nip,
                "career": student.career,
                "careerId": student.careerId,
                "idRole": student.idRole,
                "averageOriginSchool": student.averageOriginSchool,
                "birthPlace": student.birthPlace,
                "city": student.city,
                "civilStatus": student.civilStatus,
                "cp": student.cp,
                "curp": student.curp,
                "disability": student.disability,
                "email": student.email,
                "etnia": student.etnia,
                "fatherLastName": student.fatherLastName,
                "firstName": student.firstName,
                "motherLastName": student.motherLastName,
                "nameOriginSchool": student.nameOriginSchool,
                "nss": student.nss,
                "originSchool": student.originSchool,
                "otherSchool": student.otherSchool,
                "phone": student.phone,
                "state": student.state,
                "street": student.street,
                "suburb": student.suburb,
                "typeDisability": student.typeDisability,
                "typeEtnia": student.typeEtnia,
                "dateBirth": student.dateBirth,
                "semester": student.semester,
                "sex": student.sex,
                "idPeriodInscription": student.idPeriodInscription,
                "folderId": student.folderId,
                "documents": student.documents,
                "inscriptionStatus": student.inscriptionStatus,
                "stepWizard": student.stepWizard,
                "acceptedTerms": student.acceptedTerms,
                "dateAcceptedTerms": student.dateAcceptedTerms,
                "printCredential": student.printCredential,
                "warningAnalysis": student.warningAnalysis,
                documentsModified: documentsHaveChanges(student.documents, student.inscriptionStatus),
                totalDocumentsNumber:mapedDocs.length,
                documentsReviewNumber:mapedDocs.filter(doc => doc.statusName !== 'EN PROCESO').length,
                documentsLastStatus:mapedDocs
            }));
            res.status(status.OK).json({ students: newStudents });
        }
    );
};

const mapDocuments = (documents) => {
    return documents.map(
        doc => {
            const stat = doc.status.filter(
                st => st.active == true)[0];
            return {
                filename: doc.filename,
                statusName: stat ? stat.name : null
            }
        }


    ).filter(
        docFiltered => docFiltered.filename.indexOf('SOLICITUD') < 0 && docFiltered.filename.indexOf('CONTRATO') < 0 && docFiltered.statusName !== null
    );
};

const documentsHaveChanges = (documents, status) => {
    if (status == 'En Proceso') {

        const changes = documents.filter(doc => doc.filename.indexOf('SOLICITUD') < 0 && doc.filename.indexOf('CONTRATO') < 0).map(
            filteredDoc => {
                if (filteredDoc.status.length > 1) {
                    const curStatus = filteredDoc.status[filteredDoc.status.length - 1];

                    return curStatus.name == 'EN PROCESO' ? { filename: filteredDoc.filename, moified: true } : { filename: filteredDoc.filename, moified: false };
                } else { return { err: false }; }
            }
        ).filter(mapedDocument => mapedDocument.moified == true);
        return changes.length > 0 ? 'true' : 'false';
    } else {
        return 'false';
    }

};

const documentsHaveChangesAdmin = (documents, status) => {
    if (status == 'En Proceso') {

        const changes = documents.filter(doc => doc.filename.indexOf('SOLICITUD') < 0 && doc.filename.indexOf('CONTRATO') < 0).map(
            filteredDoc => {
                if (filteredDoc.status.length > 1) {
                    const curStatus = filteredDoc.status[filteredDoc.status.length - 1];

                    return curStatus.name == 'EN PROCESO' || curStatus.name == 'VALIDADO' ? { filename: filteredDoc.filename, moified: true } : { filename: filteredDoc.filename, moified: false };
                } else { return { err: false }; }
            }
        ).filter(mapedDocument => mapedDocument.moified == true);
        return changes.length > 0 ? 'true' : 'false';
    } else {
        return 'false';
    }

};

const getStudentsInscriptionLogged = (req, res) => {
    _student.find({ "stepWizard": 0 })
        .exec(handler.handleMany.bind(null, 'students', res));
};

const getStudentsInscriptionProcess = (req, res) => {
    _student.find({ $and: [{ "inscriptionStatus": { $exists: true } }, { "inscriptionStatus": "En Proceso" }] }).then(
        students => {
            const newStudents = students.map(student => ({
                "_id": student._id,
                "fullName": student.fullName,
                "controlNumber": student.controlNumber,
                "nip": student.nip,
                "career": student.career,
                "careerId": student.careerId,
                "idRole": student.idRole,
                "averageOriginSchool": student.averageOriginSchool,
                "birthPlace": student.birthPlace,
                "city": student.city,
                "civilStatus": student.civilStatus,
                "cp": student.cp,
                "curp": student.curp,
                "disability": student.disability,
                "email": student.email,
                "etnia": student.etnia,
                "fatherLastName": student.fatherLastName,
                "firstName": student.firstName,
                "motherLastName": student.motherLastName,
                "nameOriginSchool": student.nameOriginSchool,
                "nss": student.nss,
                "originSchool": student.originSchool,
                "otherSchool": student.otherSchool,
                "phone": student.phone,
                "state": student.state,
                "street": student.street,
                "suburb": student.suburb,
                "typeDisability": student.typeDisability,
                "typeEtnia": student.typeEtnia,
                "dateBirth": student.dateBirth,
                "semester": student.semester,
                "sex": student.sex,
                "idPeriodInscription": student.idPeriodInscription,
                "folderId": student.folderId,
                "documents": student.documents,
                "inscriptionStatus": student.inscriptionStatus,
                "stepWizard": student.stepWizard,
                "acceptedTerms": student.acceptedTerms,
                "dateAcceptedTerms": student.dateAcceptedTerms,
                "printCredential": student.printCredential,
                "warningAnalysis": student.warningAnalysis
                ,
                documentsModified: documentsHaveChanges(student.documents, student.inscriptionStatus),
                totalDocumentsNumber: mapDocuments(student.documents).length,
                documentsReviewNumber: mapDocuments(student.documents).filter(doc => doc.statusName !== 'EN PROCESO').length,
                documentsLastStatus: mapDocuments(student.documents),
                documentsModifiedAdmin: documentsHaveChangesAdmin(student.documents, student.inscriptionStatus)
            }));
            res.status(status.OK).json({ students: newStudents });
        }
    );
};

const getStudentsInscriptionPendant = (req, res) => {
    _student.find({ $or: [{ $and: [{ "inscriptionStatus": { $exists: true } }, { "inscriptionStatus": "En Captura" }] }, { $and: [{ "inscriptionStatus": { $exists: true } }, { "inscriptionStatus": "Enviado" }] }] }).then(
        students => {
            const newStudents = students.map(student => ({
                "_id": student._id,
                "fullName": student.fullName,
                "controlNumber": student.controlNumber,
                "nip": student.nip,
                "career": student.career,
                "careerId": student.careerId,
                "idRole": student.idRole,
                "averageOriginSchool": student.averageOriginSchool,
                "birthPlace": student.birthPlace,
                "city": student.city,
                "civilStatus": student.civilStatus,
                "cp": student.cp,
                "curp": student.curp,
                "disability": student.disability,
                "email": student.email,
                "etnia": student.etnia,
                "fatherLastName": student.fatherLastName,
                "firstName": student.firstName,
                "motherLastName": student.motherLastName,
                "nameOriginSchool": student.nameOriginSchool,
                "nss": student.nss,
                "originSchool": student.originSchool,
                "otherSchool": student.otherSchool,
                "phone": student.phone,
                "state": student.state,
                "street": student.street,
                "suburb": student.suburb,
                "typeDisability": student.typeDisability,
                "typeEtnia": student.typeEtnia,
                "dateBirth": student.dateBirth,
                "semester": student.semester,
                "sex": student.sex,
                "idPeriodInscription": student.idPeriodInscription,
                "folderId": student.folderId,
                "documents": student.documents,
                "inscriptionStatus": student.inscriptionStatus,
                "stepWizard": student.stepWizard,
                "acceptedTerms": student.acceptedTerms,
                "dateAcceptedTerms": student.dateAcceptedTerms,
                "printCredential": student.printCredential,
                "warningAnalysis": student.warningAnalysis,
                totalDocumentsNumber: mapDocuments(student.documents).length,
                documentsReviewNumber: mapDocuments(student.documents).filter(doc => doc.statusName !== 'EN PROCESO').length,
                documentsLastStatus: mapDocuments(student.documents)
            }));
            res.status(status.OK).json({ students: newStudents });
        }
    );
};

const getStudentsInscriptionAcept = (req, res) => {
    _student.find({ $or: [{ $and: [{ "inscriptionStatus": { $exists: true } }, { "inscriptionStatus": "Verificado" }] }, { $and: [{ "inscriptionStatus": { $exists: true } }, { "inscriptionStatus": "Aceptado" }] }] }).then(
        students => {
            const newStudents = students.map(student => ({
                "_id": student._id,
                "fullName": student.fullName,
                "controlNumber": student.controlNumber,
                "nip": student.nip,
                "career": student.career,
                "careerId": student.careerId,
                "idRole": student.idRole,
                "averageOriginSchool": student.averageOriginSchool,
                "birthPlace": student.birthPlace,
                "city": student.city,
                "civilStatus": student.civilStatus,
                "cp": student.cp,
                "curp": student.curp,
                "disability": student.disability,
                "email": student.email,
                "etnia": student.etnia,
                "fatherLastName": student.fatherLastName,
                "firstName": student.firstName,
                "motherLastName": student.motherLastName,
                "nameOriginSchool": student.nameOriginSchool,
                "nss": student.nss,
                "originSchool": student.originSchool,
                "otherSchool": student.otherSchool,
                "phone": student.phone,
                "state": student.state,
                "street": student.street,
                "suburb": student.suburb,
                "typeDisability": student.typeDisability,
                "typeEtnia": student.typeEtnia,
                "dateBirth": student.dateBirth,
                "semester": student.semester,
                "sex": student.sex,
                "idPeriodInscription": student.idPeriodInscription,
                "folderId": student.folderId,
                "documents": student.documents,
                "inscriptionStatus": student.inscriptionStatus,
                "stepWizard": student.stepWizard,
                "acceptedTerms": student.acceptedTerms,
                "dateAcceptedTerms": student.dateAcceptedTerms,
                "printCredential": student.printCredential,
                "warningAnalysis": student.warningAnalysis,
                totalDocumentsNumber: mapDocuments(student.documents).length,
                documentsReviewNumber: mapDocuments(student.documents).filter(doc => doc.statusName !== 'EN PROCESO').length,
                documentsLastStatus: mapDocuments(student.documents)
            }));
            res.status(status.OK).json({ students: newStudents });
        }
    );
};

const getById = (req, res) => {
    const { _id } = req.params;
    _student.find({ _id: _id })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const verifyStatus = async (req, res) => {
    const { nc } = req.params;
    const period = await getPeriod();
    const req3 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/alumnoSeleccionMaterias/${nc}/${period}`);

    req3.end();

    //Verificamos que tenga carga activa
    req3.on('response', (res2) => {
        respApi2 = res2.body;
        console.log(respApi2);

        //Tiene carga activa
        if (respApi2 && respApi2.error === 'FALSE') {
            console.log('Si tiene materias cargadas');
            return res.status(status.OK).json({
                status: 1,
                msg: 'Si tiene materias cargadas'
            });
        } else {
            return res.status(status.UNAUTHORIZED).json({
                status: 0,
                error: 'No puede ingresar debido a que no es alumno del periodo actual (No tiene materias cargadas)'
            });
        }
    });
};

function getPeriod() {
    return new Promise(async (resolve) => {
        await _period.findOne({ active: true }, (err, period) => {
            if (!err && period) {
                resolve(period.code);
            }
        });
    });
}

const getByControlNumber = (req, res) => {
    const { controlNumber } = req.body;
    // Hacer la petición hacia API de NIP y número de control
    _student.find({ controlNumber: controlNumber })
        .exec(
            (err, students) => {
                if (err) {
                    console.log("errr", err);
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        error: err.toString()
                    });
                }
                if (!students.length) {
                    return res.status(status.NOT_FOUND).json({
                        error: 'student not found'
                    });
                }

                let oneStudent = students[0];

                const token = jwt.sign({ email: controlNumber }, config.secret);

                let formatStudent = {
                    _id: oneStudent._id,
                    name: {
                        firstName: oneStudent.fullName,
                        lastName: oneStudent.fullName,
                        fullName: oneStudent.fullName
                    },
                    email: oneStudent.controlNumber,
                    role: 2
                };

                res.json({
                    user: formatStudent,
                    token: token,
                    action: 'signin'
                });

            }
        )
};

const getStudentByControlNumber = (req, res) => {
    const { controlNumber } = req.body;
    _student.find({ controlNumber: controlNumber }, { fullName: 1, career: 1, controlNumber: 1 }).exec(handler.handleOne.bind(null, 'student', res));
};

const search = (req, res) => {
    const { start = 0, limit = 10 } = req.query;
    const { search } = req.params;

    if (!search) {
        return getAll(req, res);
    }

    const query = {
        $text: {
            $search: search,
            $language: 'es'
        }
    };
    console.log('query', query);
    _student.find(query, null, {
        skip: +start,
        limit: +limit
    }).exec(handler.handleMany.bind(null, 'students', res));
};

const create = async (req, res, next) => {

    const student = req.body;
    const studentRoleId = await getStudentRoleId();
    student.idRole = studentRoleId;
    _student.create(student).then(created => {
        res.json({
            presentation: created
        });
    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    );
};

const createWithoutImage = async (req, res) => {
    const student = req.body;
    const studentRoleId = await getStudentRoleId();
    student.idRole = studentRoleId;
    console.log(student);
    _student.create(student).then(created => {
        res.json(created);
    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        }));
};

const updateStudent = (req, res) => {
    const { _id } = req.params;
    let student = req.body;
    const query = { _id: _id };
    _student.findOneAndUpdate(query, student, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const updateStudentApp = (req, res) => {
    const { _id } = req.params;
    let student = req.body;
    student.fullName = student.fullName ? student.fullName : `${student.firstName} ${student.fatherLastName} ${student.motherLastName}`;
    const query = { _id: _id };
    _student.findOneAndUpdate(query, student, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const uploadImage = (req, res) => {
    const { _id } = req.params;
    const image = req.file;
    console.log(_id);
    console.log(image);


    // const query = { _id: _id };
    // const updated = { filename: image.filename };

    // _student.findOneAndUpdate(query, updated, { new: true })
    //     .exec(handler.handleOne.bind(null, 'student', res));
};

const updateOne = (req, res, imgId) => {
    const query = { _id: res.post_id };

    _student.findOneAndUpdate(query).exec((err, query) => {
        if (query) {
            handler.handleOne.bind(null, 'students', res)
        }
    })
};

const getOne = (req, res) => {
    const { _id } = req.params;
    const query = { _id: _id };

    if (_id != '1') {

        _student.findById(query, (err, student) => {
            if (err) {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la imagen para este registro'
                });
            }
            if (student.filename) {
                res.set('Content-Type', 'image/jpeg');
                fs.createReadStream(path.join('images', student.filename)).pipe(res);
            } else {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la imagen para este registro'
                });
            }

        });
    } else {
        res.status(status.NOT_FOUND).json({
            error: 'No se encontro la imagen para este registro'
        });
    }
};

const assignDocument = (req, res) => {
    const { _id } = req.params;
    const _doc = req.body;
    const query = { _id: _id, documents: { $elemMatch: { type: _doc.doc.type } } };
    const push = { $push: { documents: _doc } };
    _student.findOne(query, (e, student) => {
        if (e)
            return handler.handleError(res, status.INTERNAL_SERVER_ERROR, err);
        if (student) {
            _student.findOneAndUpdate(query, {
                $set: {
                    'documents.$.filename': _doc.filename,
                    'documents.$.status': _doc.status, 'documents.$.releaseDate': new Date()
                }
            }, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
        } else {
            _student.findOneAndUpdate({ _id: _id }, push, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
        }
    });
};

/** Start functions for inscription */
const assignDocumentDrive = (req, res) => {
    const { _id } = req.params;
    const _doc = req.body.doc;
    const status = req.body.status;

    const push = { $push: { documents: _doc } };

    _student.findOneAndUpdate({ _id: _id }, push, { new: true })
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

    // console.log('1',status);

    const docid = await getActiveStatus(_id, docName);
    if (docid) {

        const result = docid[0];
        const doc_id = result.documents[0]._id;
        if ((result.documents[0].status)) {
            if (result.documents[0].status.length === 0) {//no hay estatus activo 
                return await _student.findOneAndUpdate(
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
            } else {
                return await _student.findOneAndUpdate( //cambiar active = false
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
                            console.log(doc, '4');

                            return await _student.findOneAndUpdate(
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

            return await _student.findOneAndUpdate(
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
    }

}

async function getActiveStatus(_id, filename) {
    console.log(filename, '===fole', _id);
    let id = mongoose.Types.ObjectId(_id);
    return await _student.aggregate([
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
            console.log('2', docm);

            return docm;

        }).catch(err => {
            return false;
        });
}

const getFolderId = (req, res) => {
    const { _id } = req.params;
    _student.findOne({ _id: _id }, { folderId: 1, _id: 0 })
        .populate({
            path: 'folderId', model: 'Folder',
            select: {
                idFolderInDrive: 1
            }
        })
        .then(folder => {

            res.status(200).json({ action: 'get folderid', folder: folder.folderId });
        }).catch(err => {
            console.log(err);
            res.status(404).json({ action: 'get folderid', error: err });
        });
};

const updateDocumentLog = async (req, res) => {
    const { _id } = req.params;
    const { filename, status } = req.body;
    let statusChanged = await updateDocumentStatus(_id, filename, status);
    console.log(statusChanged, req.body);

    if (statusChanged) {
        res.status(200).json({ action: "Status updated" });
    } else {
        res.status(404).json({ error: 'Status without changes' });
    }
};

const getPeriodInscription = (req, res) => {
    const { _id } = req.params;
    _student.findOne({ _id: _id }, { idPeriodInscription: 1, _id: 0 })
        .populate({
            path: 'idPeriodInscription', model: 'Period',
            select: {
                periodName: 1,
                year: 1
            }
        })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const getDocumentsDrive = async (req, res) => {
    const { _id } = req.params;
    let id = mongoose.Types.ObjectId(_id);       
    const documents = await queryDocuments(id);    
    
    if(documents && documents.error) {
        res.status(status.BAD_REQUEST).json({
            error: documents.error,
            action: 'get documents'
        });
    } else {
        res.status(status.OK).json({
            documents: documents.reverse(),
            action: 'get documents'
        });
    }
};

const queryDocuments = (id) => {


    return new Promise(async resolve => {
        await _student.aggregate([
            {
                "$match": {
                    "_id": id
                }
            },
            {
                "$project": {
                    "documents": {
                        "$filter": {
                            "input": "$documents",
                            "as": "document",
                            "cond": {
                                "$eq": ["$$document.type", "DRIVE"]
                            }
                        }
                    }
                }
            }]
        ).exec((err, documents) => {

            if (err) {
                resolve({ error: err });
            } else {
                resolve(documents[0].documents);
            }

        });
    });

};

const getCareerDetail = (req, res) => {
    const { _id } = req.params;

    _student.findOne({ _id: _id }, { careerId: 1 }).populate('careerId').then(
        student => {
            if (student) {
                res.status(status.OK).json({ career: student.careerId });
            } else {
                res.status(status.NOT_FOUND).json({ error: 'No encontrado' })
            }
        }
    ).catch(err => { res.status(status.BAD_REQUEST).json({ error: err.toString() }) });
};

/** End functions for inscription */

const getRequest = (req, res) => {    
    const { _id } = req.params;    
    _request.find({ studentId: _id }).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1,
            controlNumber: 1,
            career: 1
        }
    }).exec(handler.handleOne.bind(null, 'request', res));
};

const getResource = (req, res) => {
    const { _id } = req.params;
    const { resource } = req.params;
    _student.findOne({ _id: _id }, (error, student) => {
        if (error)
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
        _request.findOne({ studentId: _id }, (errorRequest, request) => {
            if (errorRequest)
                return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
            if (!request.documents)
                return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
            var fileInformation = request.documents.find(f => f.nameFile.includes(resource.toUpperCase()));
            if (!fileInformation)
                return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
            res.set('Content-Type', 'image/jpeg');
            fs.createReadStream(path.join('documents', fileInformation.nameFile)).pipe(res);
        });
    });
};

const getFilePDF = (req, res) => {
    const { resource, _id } = req.params;
    _request.findOne({ _id: _id }, (err, request) => {
        if (!err && request) {
            const fileInformation = request.documents.find(file => file.nameFile.includes(resource.toUpperCase()));
            if (!fileInformation) {
                return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
            }
            res.set('Content-Type', 'application/pdf');
            fs.createReadStream(path.join('documents', fileInformation.nameFile)).pipe(res);
        } else {
            return handler.handleError(res, status.NOT_FOUND, { message: 'Recurso no encontrado' });
        }
    });
};

const getStudentRoleId = () => {
    return new Promise(async (resolve) => {
        await _role.findOne({ name: { $regex: new RegExp(`^Estudiante$`) } }, (err, role) => {
            if (!err && role) {
                resolve(role.id);
            }
        });
    });
};

const getDocumentsStatus = async (req, res) => {
    const { _id } = req.params;
    let id = mongoose.Types.ObjectId(_id);
    const documents = await queryDocuments(id);

    if (documents == null) {
        res.status(status.BAD_REQUEST).json({
            error: 'No tiene documentos',
            action: 'get documents status'
        });
    } else if (documents.error) {
        res.status(status.BAD_REQUEST).json({
            error: documents.error,
            action: 'get documents status'
        });
    } else {
        res.status(status.OK).json({
            documents: documents.map(
                doc => {
                    const stat = doc.status.filter(
                        st => st.active == true)[0];
                    return {
                        filename: doc.filename,
                        statusName: stat ? stat.name : null
                    }
                }


            ).filter(
                docFiltered => docFiltered.filename.indexOf('SOLICITUD') < 0 && docFiltered.filename.indexOf('CONTRATO') < 0 && docFiltered.statusName !== null
            ),
            action: 'get documents status'
        });
    }
};

const documentsChanged = (req, res) => {
    _student.find({
        "$or": [{ "inscriptionStatus": "En Captura" }, { "inscriptionStatus": "En Proceso" }]
    }).then(students => {
        if (students.length == 0) {
            return res.status(status.NOT_FOUND).json({ err: 'Not found' });
        } else {
            const sts = students.map(stu => ({
                _id: stu._id,
            }));
        }
    });
};

// NOTIFICATIONS FOR APP =========================
const sendNotification = (req,res)=>{
    var FCM = require('fcm-node');
    var fcm = new FCM(config.FCM_SERVERKEY);
    const {token,title,body,screen} = req.body;

    const message = { 
        registration_ids: token, 
        collapse_key: 'soytigretectepic',        
        notification: {
            title, 
            body 
        },
        // sound:'default',
        click_action:'FCM_PLUGIN_ACTIVITY' ,       
        data: {  //you can send only notification or only data(or include both)
            screen,
            title,
            body            
        }
    };    
    fcm.send(message, (err, response)=>{
        if (err) {
            const error = JSON.parse(err);
            if(error.success>0){
                console.log("Successfully sent ");
                res.status(status.OK).json({msg:"Notificación enviada"});
            }else{
                console.log("Something has gone wrong!",error);
                res.status(status.BAD_REQUEST).json({err:"No se pudo enviar la notificación."});

            }
        } else {
            console.log("Successfully sent");
            res.status(status.OK).json({msg:"Notificación enviada"});
        }
    });
};
 /// endo notifications for app
const isStudentForInscription = (req,res)=>{
    const controlNumber = req.params.nc;
    const options = {
        "rejectUnauthorized": false,
        host: 'wsescolares.tepic.tecnm.mx',
        port: 443,
        path: `/alumnos/info/${controlNumber}`,
        // authentication headers     
        headers: {
            'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64')
        }
    };
    var studentNew = "";

    https.get(options, function (apiInfo) {

        apiInfo.on('data', function (data) {
            studentNew += data;
        });
        apiInfo.on('end', () => {
            //json con los datos del alumno
            studentNew = JSON.parse(studentNew);
            
            const {income,semester} = studentNew;            
            const st = studentNew.status;
            console.log(income,'income');
            console.log(st,'status');
            console.log(semester,'semester');
            
            if ((semester == 1 || income == 2 || income == 3 || income == 4) || (semester == 1 && income == 1 )) {
                return res.status(status.OK).json({controlNumber,inscription:true});
            }else{
                return res.status(status.NOT_FOUND).json({controlNumber,inscription:false});
            }            
        });
        apiInfo.on('error', function (e) {
            return res.status(status.NOT_FOUND).json({controlNumber,inscription:false});
        });
    });    
};

/**
 * 
 * @param {controlNumber: Número de control, ej. 15400001} controlNumber 
 * @param {Grado: Grado, lic=licenciatura, mas=maestria, doc=doctorado, ndefault: lic} grade 
 */
const mapInscriptionDocuments = (controlNumber, grade='lic')=>{
    return new Promise((resolve)=>{
        _student.findOne({controlNumber},{documents:1}).then(
            (student)=>{
                if(student){
                    if(grade === 'lic'){

                        resolve(
                            student.documents.map((doc)=>
                            {
                                let name = doc.filename;                                
                                name = 
                                name.indexOf(eInsFiles.PHOTO) !== -1 ? {shortName:'FOTO',fullName:'FOTO',position:6} 
                                : name.indexOf(eInsFiles.CERTIFICATE_BACH) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO BACHILLERATO',filename:name,position:2} 
                                :name.indexOf(eInsFiles.CLINIC) !== -1 ? {shortName:'CLÍNICOS',fullName:'ANÁLISIS CLÍNICOS',filename:name,position:5}
                                :name.indexOf(eInsFiles.CURP) !== -1 ? {shortName:'CURP',fullName:'CURP',position:3} 
                                :name.indexOf(eInsFiles.BIRTH_CERTIFICATE) !== -1 ?{shortName:'ACTA',fullName:'ACTA DE NACIMIENTO',filename:name,position:4}  
                                :name.indexOf(eInsFiles.LETTER_BACH) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO BACHILLERATO',filename:name,position:2}
                                :name.indexOf(eInsFiles.PAY) !== -1 ? {shortName:'COMPROBANTE',fullName:'COMPROBANTE DE PAGO',filename:name,position:1}
                                :name.indexOf(eInsFiles.NSS)  !== -1?{shortName:'NSS',fullName:'CONSTANCIA DE VIGENCIA DE DERECHOS IMSS',filename:name,position:7} 
                                :'';
                                const docStatus = doc.status.filter((stat)=> stat.active==true)[0];
                                return {
                                    file:name,
                                    fileIdInDrive:doc.fileIdInDrive,
                                    status: docStatus.name
                                    ,
                                    observation: docStatus.observation ? docStatus.observation :'',
                                    history: doc.status.map( (st)=>({name:st.name,date:st.date,message:st.message,observation:st.observation ? st.observation :''}))
                                };
                            }
                            )
                        );
                    }

                    if(grade === 'mas'){
                        resolve(
                            student.documents.map((doc)=>
                            {
                                let name = doc.filename;                                
                                name = 
                                name.indexOf(eInsFiles.PHOTO) !== -1 ? {shortName:'FOTO',fullName:'FOTO',filename:name,position:9} 
                                : name.indexOf(eInsFiles.CERTIFICATE_LIC) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO LICENCIATURA',filename:name,position:2} 
                                :name.indexOf(eInsFiles.CLINIC) !== -1 ? {shortName:'CLÍNICOS',fullName:'ANÁLISIS CLÍNICOS',filename:name,position:8}
                                :name.indexOf(eInsFiles.CURP) !== -1 ? {shortName:'CURP',fullName:'CURP',filename:name,position:6} 
                                :name.indexOf(eInsFiles.BIRTH_CERTIFICATE) !== -1 ?{shortName:'ACTA',fullName:'ACTA DE NACIMIENTO',filename:name,position:7}  
                                :name.indexOf(eInsFiles.LETTER_CERT_LIC) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO LICENCIATURA',filename:name,position:2}
                                :name.indexOf(eInsFiles.PAY) !== -1 ? {shortName:'COMPROBANTE',fullName:'COMPROBANTE DE PAGO',filename:name,position:1}
                                :name.indexOf(eInsFiles.NSS)  !== -1?{shortName:'NSS',fullName:'CONSTANCIA DE VIGENCIA DE DERECHOS IMSS',filename:name,position:10} 
                                :name.indexOf(eInsFiles.DEGREE_LIC)  !== -1?{shortName:'TÍTULO LICENCIATURA',fullName:'TÍTULO LICENCIATURA',position:3} 
                                :name.indexOf(eInsFiles.CED_LIC)  !== -1?{shortName:'CEDULA',fullName:'CEDULA LICENCIATURA',filename:name,position:4} 
                                :name.indexOf(eInsFiles.TEST_LIC)  !== -1?{shortName:'ACTA DE EXAMEN',fullName:'ACTA DE EXAMEN LICENCIATURA',position:5}                                 
                                :name.indexOf(eInsFiles.LETTER_DEGREE_LIC)  !== -1?{shortName:'CARTA COMPROMISO TÍTULO LICENCIATURA',fullName:'CARTA COMPROMISO TÍTULO LICENCIATURA',filename:name,position:3} 
                                :name.indexOf(eInsFiles.LETTER_CED_LIC)  !== -1?{shortName:'CARTA COMPROMISO CEDULA',fullName:'CARTA COMPROMISO CEDULA LICENCIATURA',filename:name,position:4} 
                                :name.indexOf(eInsFiles.LETTER_TEST_LIC)  !== -1?{shortName:'CARTA COMPROMISO ACTA DE EXAMEN',fullName:'CARTA COMPROMISO ACTA DE EXAMEN LICENCIATURA',filename:name,position:5} 
                                :'';
                                const docStatus = doc.status.filter((stat)=> stat.active==true)[0];
                                return {
                                    file:name,
                                    fileIdInDrive:doc.fileIdInDrive,
                                    status: docStatus.name,
                                    observation: docStatus.observation ? docStatus.observation :'',
                                    history: doc.status.map( (st)=>({name:st.name,date:st.date,message:st.message,observation:st.observation ? st.observation :''}))
                                };
                            }
                            )
                        );
                    }

                    if(grade === 'doc'){
                        resolve(
                            student.documents.map((doc)=>
                            {
                                let name = doc.filename;                                
                                name = 
                                name.indexOf(eInsFiles.PHOTO) !== -1 ? {shortName:'FOTO',fullName:'FOTO',filename:name,position:9} 
                                : name.indexOf(eInsFiles.CERTIFICATE_MA) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO MAESTRÍA',filename:name,position:2} 
                                :name.indexOf(eInsFiles.CLINIC) !== -1 ? {shortName:'CLÍNICOS',fullName:'ANÁLISIS CLÍNICOS',filename:name,position:8}
                                :name.indexOf(eInsFiles.CURP) !== -1 ? {shortName:'CURP',fullName:'CURP',filename:name,position:6} 
                                :name.indexOf(eInsFiles.BIRTH_CERTIFICATE) !== -1 ?{shortName:'ACTA',fullName:'ACTA DE NACIMIENTO',filename:name,position:7}  
                                :name.indexOf(eInsFiles.LETTER_CERT_MA) !== -1 ? {shortName:'CERTIFICADO',fullName:'CERTIFICADO MAESTRÍA',filename:name,position:2}
                                :name.indexOf(eInsFiles.PAY) !== -1 ? {shortName:'COMPROBANTE',fullName:'COMPROBANTE DE PAGO',filename:name,position:1}
                                :name.indexOf(eInsFiles.NSS)  !== -1?{shortName:'NSS',fullName:'CONSTANCIA DE VIGENCIA DE DERECHOS IMSS',filename:name,position:10} 
                                :name.indexOf(eInsFiles.DEGREE_MA)  !== -1?{shortName:'TÍTULO MAESTRÍA',fullName:'TÍTULO MAESTRÍA',filename:name,position:3} 
                                :name.indexOf(eInsFiles.CED_MA)  !== -1?{shortName:'CEDULA',fullName:'CEDULA MAESTRÍA',filename:name,position:4} 
                                :name.indexOf(eInsFiles.TEST_MA)  !== -1?{shortName:'ACTA DE EXAMEN',fullName:'ACTA DE EXAMEN MAESTRÍA',filename:name,position:5}                                 
                                :name.indexOf(eInsFiles.LETTER_DEGREE_MA)  !== -1?{shortName:'CARTA COMPROMISO TÍTULO MAESTRÍA',fullName:'CARTA COMPROMISO TÍTULO MAESTRÍA',filename:name,position:3} 
                                :name.indexOf(eInsFiles.LETTER_CED_MA)  !== -1?{shortName:'CARTA COMPROMISO CEDULA',fullName:'CARTA COMPROMISO CEDULA MAESTRÍA',filename:name,position:4} 
                                :name.indexOf(eInsFiles.LETTER_TEST_MA)  !== -1?{shortName:'CARTA COMPROMISO ACTA DE EXAMEN',fullName:'CARTA COMPROMISO ACTA DE EXAMEN MAESTRÍA',filename:name,position:5} 
                                :'';
                                const docStatus = doc.status.filter((stat)=> stat.active==true)[0];
                                return {
                                    file:name,
                                    fileIdInDrive:doc.fileIdInDrive,
                                    status: docStatus.name,
                                    observation: docStatus.observation ? docStatus.observation :'',
                                    history: doc.status.map( (st)=>({name:st.name,date:st.date,message:st.message,observation:st.observation ? st.observation :''}))
                                };
                            }
                            )
                        );
                    }
                }
                resolve(false);
            }
        ).catch(err=>resolve(false));
    });
};

const getInscriptionDocuments = async (req,res)=>{
    const {nc,grade} = req.params;
    const documents = await mapInscriptionDocuments(nc,grade.toLowerCase().trim());
    const docs = documents.sort( (a,b)=> a.file.position - b.file.position);
    res.status(status.OK).json({docs});
};
module.exports = (Student, Request, Role, Period) => {
    _student = Student;
    _request = Request;
    
    _role = Role;
    _period = Period;
    
    return ({
        create,
        getOne,
        updateOne,
        getAll,
        search,
        uploadImage,
        updateStudent,
        getByControlNumber,
        getById,
        verifyStatus,
        createWithoutImage,
        assignDocument,
        getStudentByControlNumber,
        getRequest,
        getResource,
        getFilePDF,
        assignDocumentDrive,
        getDocumentsDrive,
        getFolderId,
        getPeriodInscription,
        updateDocumentLog,
        getStudentsInscription,
        getCareerDetail,
        getDocumentsStatus,
        updateStudentApp,
        getStudentsInscriptionLogged,
        getStudentsInscriptionProcess,
        getStudentsInscriptionPendant,
        getStudentsInscriptionAcept,
        sendNotification,
        isStudentForInscription,
        getInscriptionDocuments
    });
};