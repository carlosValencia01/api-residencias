const handler = require('../../utils/handler');
const status = require('http-status');


let _englishState;

const getAllEnglishStates = (req, res) => {
    _englishState.find({})
      .exec(handler.handleMany.bind(null, 'englishStates', res));
  };

const getEnglishStateByStudentId = (req, res) => {
const { studentId } = req.body;
_englishState.find({ studentId: studentId }, { studentId: 1 })
    .exec(handler.handleOne.bind(null, 'englishState', res));
};

const createEnglishState = (req, res) => {
    const englishState = req.body;
    _englishState.create(englishState)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear el estado de ingles en el estudiante' }));
  };

  const updateEnglishState = (req, res) => {
    const { _id } = req.params;
    const englishState = req.body;
    _englishState.updateOne({ _id: _id }, englishState)
      .then(updated => res.status(status.OK).json(updated))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el estado de ingles en el estudiante' }));
  };

  module.exports = EnglishState => {
    _englishState = EnglishState;
    return ({
        createEnglishState,
        updateEnglishState,
        getAllEnglishStates,
        getEnglishStateByStudentId,
    });
  };