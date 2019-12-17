const handler = require('../../utils/handler');
const status = require('http-status');

let _department;
let _employee;
let _position;

const getAll = (req, res) => {
  _department.find({ "careers.0": { "$exists": true } })
      .exec(async (err, data) => {
        if (!err && data) {
          const departments = [];
          for await (let department of data) {
            const depto = department.toObject();
            const employeesDepto = await _getEmployeesByDepartment(depto);
            depto.Employees = employeesDepto.employees;
            depto.boss = employeesDepto.boss;
            departments.push(depto);
          }
          res.status(status.OK)
              .json({departments: departments});
        } else {
          res.status(status.INTERNAL_SERVER_ERROR)
              .json({error: err ? err.toString() : 'Ocurrió un error'});
        }
      });
};

const _getEmployeesByDepartment = (department) => {
  return new Promise(resolve => {
    _employee.find()
        .populate({
          path: 'positions.position', model: 'Position', select: 'name ascription',
          populate: { path: 'ascription', model: 'Department', select: 'name shortName' }})
        .exec((err, data) => {
          if (!err && data) {
            const employees = [];
            let departmentBoss = {};
            data.forEach(data => {
              if (data.positions.length) {
                const employee = data.toObject();
                const activePositions = employee.positions
                    .filter(pos => pos.status === 'ACTIVE' && pos.position.ascription._id.toString() === department._id.toString());
                const positions = activePositions.filter(pos => pos.position.name.toUpperCase() === 'DOCENTE');
                const boss = activePositions.filter(pos => pos.position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO')[0];
                employee.positions = positions;
                if (positions.length) {
                  employees.push(employee);
                }
                if (boss) {
                  employee.positions.push(boss);
                  departmentBoss = employee;
                }
              }
            });
            resolve({
              employees: employees,
              boss: departmentBoss
            });
          }
        });
  });
};

const getAllDepartments = (req, res) => {
  _department.find({})
      .populate('careers')
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

module.exports = (Deparment, Employee, Position) => {
  _department = Deparment;
  _employee = Employee;
  _position = Position;
  return ({
    getAll,
    getAllDepartments,
    createDepartment,
    updateDepartment,
    removeDepartment,
  });
};
