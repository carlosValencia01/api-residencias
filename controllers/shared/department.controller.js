const handler = require('../../utils/handler');
const status = require('http-status');

let _department;
let _position;

const getAll = (req, res) => {
  let query2 = [
    {
      $lookup:
      {
        from: 'employees',
        localField: '_id',
        foreignField: 'deptoId',
        as: 'Employees'
      }
    }
  ];
  _department.aggregate(query2).exec(handler.handleMany.bind(null, 'departments', res));
};

const getAllDepartments = (req, res) => {
  _department.find({})
      .exec(handler.handleMany.bind(null, 'departments', res));
};

const createDepartment = (req, res) => {
  const department = req.body;
  _department.create(department)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({message: 'Error al crear departamento'}));
};

const updateDepartment = (req, res) => {
  const {_id} = req.params;
  const department = req.body;
  _department.updateOne({_id: _id}, department)
      .then(updated => res.status(status.OK).json(updated))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({message: 'Error al actualizar departamento'}));
};

const removeDepartment = (req, res) => {
  const {_id} = req.params;
  _position.find({ascription: _id})
      .then(positions => {
        if (!positions.length) {
          _department.deleteOne({_id: _id})
              .then(deleted => res.status(status.OK).json(deleted))
              .catch(_ => res
                  .status(status.INTERNAL_SERVER_ERROR)
                  .json({message: 'Error al borrar departamento'}));
        } else {
          res
              .status(status.INTERNAL_SERVER_ERROR)
              .json({message: 'El departamento tiene puestos asignados.'});
        }
      })
      .catch(err => res
          .status(status.INTERNAL_SERVER_ERROR)
          .json({message: (err || 'Ocurrió un error').toString()}));
};

module.exports = (Deparment, Position) => {
  _department = Deparment;
  _position = Position;
  return ({
    getAll,
    getAllDepartments,
    createDepartment,
    updateDepartment,
    removeDepartment,
  });
};
