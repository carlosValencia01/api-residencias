const handler = require('../../utils/handler');
const status = require('http-status');
let _department;
let _employee;

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
      .exec(handler.handleMany.bind(null, 'departments', res));
};

module.exports = (Deparment, Employee) => {
  _department = Deparment;
  _employee = Employee;
  return ({
    getAll,
    getAllDepartments,
  });
};
