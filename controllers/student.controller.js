const handler = require('../utils/handler');
const status = require('http-status');
const fs = require('fs')
const path = require('path');
const del = require('del');
const jwt = require('jsonwebtoken');
const config = require('../_config');
const superagent = require('superagent');

let _student;

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
        if (respApi2 && respApi2.error === "FALSE") {
            console.log("Si tiene materias cargadas");
            return res.status(status.OK).json({
                status: 1,
                msg:'Si tiene materias cargadas'
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
    console.log("ControlNumer" + controlNumber);
    //Hacer la petición hacia API de NIP y número de control
    _student.find({ controlNumber: controlNumber })
        //.exec(handler.handleOne.bind(null, 'student', res));
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
                }

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
}

const createWithoutImage = (req, res) => {
    const student = req.body;
    console.log(student);
    _student.create(student).then(created => {
        res.json(created);
    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        }));
}

const updateStudent = (req, res) => {
    const { _id } = req.params;
    const student = req.body;

    const query = { _id: _id };
    _student.findOneAndUpdate(query, student, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
}

const uploadImage = (req, res) => {
    const { _id } = req.params;
    const image = req.file;

    // console.log('MIRA AQUIIIII',image);

    const query = { _id: _id };
    const updated = { filename: image.filename };

    _student.findOneAndUpdate(query, updated, { new: true })
        .exec(handler.handleOne.bind(null, 'student', res));
}

const updateOne = (req, res, imgId) => {
    const query = { _id: res.post_id }

    _student.findOneAndUpdate(query).exec((err, query) => {
        if (query) {
            handler.handleOne.bind(null, 'students', res)
        }
    })
}


const getOne = (req, res) => {
    const { _id } = req.params;
    const query = { _id: _id };

    if (_id != '1') {

        _student.findById(query, (err, student) => {
            if (err) {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la imagen para este registro'
                });
                /*res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                });*/
            }
            if (student.filename) {
                // console.log('Entro AQUI');
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
}
/*
const create = (req,res) => {
    const student = req.body;
    _student.findOneAndUpdate(student, student, {
        strict: false,
        upsert: true,
        new: true,
        runValidators: true
    }).exec(handler.handleOne.bind(null, 'students', res));
};
*/

module.exports = (Student) => {
    _student = Student;
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
        createWithoutImage
    });
};
