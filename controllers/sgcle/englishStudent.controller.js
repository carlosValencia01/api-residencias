const handler = require('../../utils/handler');
const status = require('http-status');

const createEnglishStudent = (req, res) => {
    const englishStudent = req.body;
    _englishStudent.create(englishStudent)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear el perfil del estudiante de Ingles' }));
};

const getEnglishStudentByStudentId = (req, res) => {
    const { _studentId } = req.params;
    _englishStudent.find({ studentId: _studentId })
        .exec(handler.handleOne.bind(null, 'englishStudent', res));
};

const updateEnglishStudent = (req, res) => {
    const { _id } = req.params;
    const englishStudent = req.body;
    _englishStudent.updateOne({ _id: _id }, englishStudent)
      .then(updated => res.status(status.OK).json(updated))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el perfil del estudiante de Ingles' }));
};
module.exports = EnglishStudent => {
    _englishStudent = EnglishStudent;
    return ({
        createEnglishStudent,
        getEnglishStudentByStudentId,
        updateEnglishStudent,
    });
};