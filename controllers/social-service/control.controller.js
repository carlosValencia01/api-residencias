const handler = require('../../utils/handler');
const status = require('http-status');

let _controlStudent;

const getAll = (req, res) => {
    _controlStudent.find({})
        .select({})
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

module.exports = (ControlStudent) => {
    _controlStudent = ControlStudent;
    return ({
        getAll,
        getControlStudentByStudentId,
        updateGeneralControlStudent
    });
};
