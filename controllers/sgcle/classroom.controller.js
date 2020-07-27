const handler = require('../../utils/handler');
const status = require('http-status');


let _classroom;

const createClassroom = (req, res) => {
    const classromm = req.body;
    _classroom.create(classromm)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Aula' }));
};

const getAllClassroom = (req, res) => {
    _classroom.find({})
        .exec(handler.handleMany.bind(null, 'classrooms', res));
    };

const removeClassroom = (req, res) => {
    const { _id } = req.params;
    _classroom.deleteOne({ _id: _id })
    .then(deleted => res.status(status.OK).json(deleted))
    .catch(_ => res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error al borrar Aula' }));
    };

module.exports = Classroom => {
    _classroom = Classroom;
    return ({
        createClassroom,
        getAllClassroom,
        removeClassroom,
    });
};