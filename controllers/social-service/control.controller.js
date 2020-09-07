const handler = require('../../utils/handler');
const status = require('http-status');

let _controlStudent;
let _student;

const getAll = (req, res) => {
    _controlStudent.find({})
        .populate({path: 'studentId', model: 'Student', select: {career: 1, fullName: 1} })
        .exec(handler.handleMany.bind(null, 'controlStudents', res));
};

const getControlStudentByStudentId = (req, res) => {
    const { studentId } = req.params;
    _controlStudent.findOne({studentId: studentId})
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

const releaseSocialServiceAssistanceCsv = (req, res) => {
    const students = req.body;
    const findStudent = (data) => {
        return _student.findOne({controlNumber: data.controlNumber})
            .then(student => {
                if (student) {
                    data._id = student._id;
                    data.exists = true;
                    return data;
                } else {
                    data.exists = false;
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
                .then(controlNumber => {
                    if (controlNumber) {
                        return null;
                    }
                    return _controlStudent.create({studentId: data._id, controlNumber: data.controlNumber, releaseAssistanceDate: new Date()});
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
          return res.status(status.OK).json({ msg: 'Estudiante actualizado correctamente' });
      }).catch( err => {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
  });
};

module.exports = (ControlStudent, Student) => {
    _controlStudent = ControlStudent;
    _student = Student;
    return ({
        getAll,
        getControlStudentByStudentId,
        createAssistanceByControlNumber,
        releaseSocialServiceAssistanceCsv,
        updateGeneralControlStudent
    });
};
