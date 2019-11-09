const handler = require('../../utils/handler');
const status = require('http-status');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
const superagent = require('superagent');
const mongoose = require('mongoose');

let _student;
let _request;

const getAll = (req, res) => {
    _student.find({})
        .exec(handler.handleMany.bind(null, 'students', res));
};

const getStudentsInscription = (req, res) => {
    _student.find({"inscriptionStatus":{$exists:true}})
        .exec(handler.handleMany.bind(null, 'students', res));
};

const getById = (req, res) => {
    const { _id } = req.params;
    _student.find({ _id: _id })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const verifyStatus = (req, res) => {
    const { nc } = req.params;

    const req3 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/alumnoSeleccionMaterias/${nc}/${config.period}`);

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

const getByControlNumber = (req, res) => {
    const { controlNumber } = req.body;
    console.log('ControlNumer' + controlNumber);
    // Hacer la petición hacia API de NIP y número de control
    _student.find({ controlNumber: controlNumber })
        .exec(
            (err, students) => {
                if (err) {
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
    console.log('query',query);
    _student.find(query, null, {
        skip: +start,
        limit: +limit
    }).exec(handler.handleMany.bind(null, 'students', res));
};

const create = (req, res, next) => {
    const student = req.body;
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

const createWithoutImage = (req, res) => {
    const student = req.body;
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
    const student = req.body;

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
    const query = { _id: _id, documents: { $elemMatch: { type: _doc.type } } };
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
        async (doc)=>{
            let statusChanged = await updateDocumentStatus(_id,_doc.filename,status);
            if(statusChanged){
                res.status(200).json({document:doc});
            }else{
                res.status(404).json({error:'Status without changes'});
            }
         }
    ).catch(err=>{
        res.status(404).json({
            error:err,
            action: 'get documents'
        });
    });    
};
async function updateDocumentStatus(_id,docName,status){
    
    console.log('1',status);
    
    const docid = await getActiveStatus(_id,docName);
    if(docid){
        
        const result = docid[0];
        console.log('3', result.documents[0].status.length);
        const doc_id = result.documents[0]._id;
        if(( result.documents[0].status.length) === 0) {//no hay estatus activo   
            console.log('3.1',doc_id,_id);
                     
            return await _student.findOneAndUpdate(
                {
                    _id: _id,
                    'documents._id':doc_id
                },
                { $push: { 'documents.$.status':status } },
                { new: true }
            )
            .then(
                doc=>{
                    return true;
                }
            ).catch(err=>{ return false;});
        }else{ //ya hay un estatus activado
            console.log('3.2');
            
            return await _student.findOneAndUpdate( //cambiar active = false
                {
                    _id:_id,
                    documents:{
                        "$elemMatch":{_id:doc_id,"status.active":true}
                        }
                },
                {
                     "$set": { 
                    "documents.$[outer].status.$[inner].active": false,}
                },
                { "arrayFilters": [
                    { "outer._id": doc_id },
                    { "inner.active": true }
                ] }
            )
            .then(
                async doc=>{
                    console.log(doc,'4');
                    
                    return await _student.findOneAndUpdate(
                        {
                            '_id':_id,
                            'documents._id':doc_id
                        },
                        { $push: { 'documents.$.status':status } },
                        { new: true }
                    )
                    .then(
                        doc=>{
                            return true;
                        }
                    ).catch(err=>{ return false;});
                }
            ).catch(err=>{return false;});
        }    
    }
    
}

async function getActiveStatus(_id,filename){
    console.log(filename,'===fole',_id);
    let id = mongoose.Types.ObjectId(_id);
    return await _student.aggregate([
        { 
            "$match": {
                "_id" :id                           
            }
        },
        {
           "$project": {
                "documents": {
                    "$filter": {
                        "input": {
                            "$map":{
                                "input":"$documents",
                                "as":"docs",
                                "in":{
                                   "$cond":[
                                         {"$eq":["$$docs.filename",filename]},
                                        {                                            
                                            "filename":"$$docs.filename",
                                            "_id":"$$docs._id",
                                            "status":{
                                                "$filter":{
                                                    "input":"$$docs.status",
                                                    "as":"status",
                                                    "cond":{ "$eq": ["$$status.active",true] }
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
        }]).then( docm=>{
            console.log('2',docm);
            
            return docm;

        }).catch(err=>{
            return false;
        });
}

const getFolderId = (req, res) => {
    const { _id } = req.params;                
    _student.findOne({ _id: _id },{folderId:1,_id:0})
    .populate({
        path: 'folderId', model: 'Folder',
        select: {
            idFolderInDrive: 1
        }
    })
    .then( folder=>{
        
        res.status(200).json({action:'get folderid',folder:folder.folderId});
    }).catch(err=>{
        console.log(err);
        res.status(404).json({action:'get folderid',error:err});
    });     
};

const updateDocumentLog = async (req,res)=>{
    const { _id } = req.params;
    const { filename, status } = req.body;
    let statusChanged = await updateDocumentStatus(_id,filename,status);
    console.log(statusChanged, req.body);
    
    if(statusChanged){
        res.status(200).json({action:"Status updated"});
    }else{
        res.status(404).json({error:'Status without changes'});
    }
};

const getPeriodInscription = (req, res) => {
    const { _id } = req.params;                
    _student.findOne({ _id: _id },{idPeriodInscription:1,_id:0})
    .populate({
        path: 'idPeriodInscription', model: 'Period',
        select: {
            periodName: 1,
            year:1
        }
    })
    .exec(handler.handleOne.bind(null, 'student', res));     
};


const getDocumentsDrive = (req,res)=>{
    const { _id } = req.params;
    let id = mongoose.Types.ObjectId(_id);        
    _student.aggregate([
        { 
            "$match": {
                "_id" :id                
            }
        },
        {
            "$project": {
                "documents": {
                    "$filter": {
                        "input": "$documents",
                        "as": "document",
                        "cond": { 
                            "$eq": [ "$$document.type", "DRIVE" ]
                        }
                    }
                }
            }
        }]
    ).exec((err,documents)=>{      
        
        if(err){
            res.status(status.BAD_REQUEST).json({
                error: err,        
                action: 'get documents'
            });
        }
        res.status(status.OK).json({
            documents:documents[0].documents,
            action: 'get documents'
        });
    })
};

/** End functions for inscription */

const csvIngles = (req, res) => {
    const _scholar = req.body;
    var findStudent = (data) => {
        return _student.findOne({ controlNumber: data.controlNumber }).then(
            oneStudent => {
                if (!oneStudent) {
                    data.isNew = true;
                    return data;
                }
                else {
                    data._id = oneStudent._id;
                    return data;
                }
            }
        );
    };

    var secondStep = (data) => {
        if (data.isNew) {
            //Add Date;
            data.document.releaseDate = new Date();
            data.documents = new Array(data.document);
            //Remove properties
            delete data.document;
            delete data.isNew;
            return _student.create(data);
        }
        else {
            const _doc = data.document;
            _doc.releaseDate = new Date();
            const query = { _id: data._id, documents: { $elemMatch: { type: _doc.type } } };
            const push = { $push: { documents: _doc } };
            _student.findOne(query).then(studentDoc => {
                if (studentDoc) {
                    return _student.findOneAndUpdate(query, { $set: { 'documents.$.status': _doc.status, 'documents.$.releaseDate': new Date() } }, { new: true });
                }
                else
                    return _student.findOneAndUpdate({ _id: data._id }, push, { new: true });
            });
        }
    };

    var actions = _scholar.map(findStudent);
    var results = Promise.all(actions);

    results.then(data => {
        return Promise.all(data.map(secondStep));
    });

    results.then((data) => {
        res.json({ 'Estatus': 'Bien', 'Data': data });
    }).catch((error) => {
        return res.json({ Error: error });
    });
};

const getRequest = (req, res) => {    
    const { _id } = req.params;    
    _request.find({ studentId: _id }).populate({
        path: 'studentId', model: 'Student',
        select: {
            fullName: 1,
            controlNumber:1,
            career:1
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

module.exports = (Student, Request) => {
    _student = Student;
    _request = Request;
    return ({
        create,
        getOne,
        updateOne,
        getAll,
        search,
        csvIngles,
        uploadImage,
        updateStudent,
        getByControlNumber,
        getById,
        verifyStatus,
        createWithoutImage,
        assignDocument,
        getRequest,
        getResource,
        getFilePDF,
        assignDocumentDrive,
        getDocumentsDrive,
        getFolderId,
        getPeriodInscription,
        updateDocumentLog,
        getStudentsInscription,
    });
};
