const handler = require('../../utils/handler');
const status = require('http-status');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
const superagent = require('superagent');

let _student;
let _request;
let _role;

const getAll = (req, res) => {
    _student.find({})
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
    const student = req.body;

    const query = { _id: _id };
    _student.findOneAndUpdate(query, student, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
};

const uploadImage = (req, res) => {
    const { _id } = req.params;
    const image = req.file;

    const query = { _id: _id };
    const updated = { filename: image.filename };

    _student.findOneAndUpdate(query, updated, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
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

const getStudentRoleId = () => {
    return new Promise(async (resolve) => {
        await _role.findOne({ name: { $regex: new RegExp(`^Estudiante$`) } }, (err, role) => {
            if (!err && role) {
                resolve(role.id);
            }
        });
    });
};


module.exports = (Student, Request, Role) => {
    _student = Student;
    _request = Request;
    _role = Role;
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
    });
};
