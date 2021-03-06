const handler = require('../../utils/handler');
const status = require('http-status');

let _department;
let _employee;
let _position;

const getAll = async (req, res) => {
  const departments = await consultAll();
  if(departments.err){
    res.status(status.INTERNAL_SERVER_ERROR)
    .json({ error: departments.err ? departments.err.toString() : 'Ocurrió un error' });
  }
  return res.status(status.OK)
          .json({ departments});  
};

const consultAll = (careerAcronym = '') => {
  return new Promise ((resolve)=>{
    _department.find({ "careers.0": { "$exists": true } })
    .populate('careers')
    .exec(async (err, data) => {
      if (!err && data) {
        const departments = [];
        for (let department of data) {
          const depto = await _getDepartmentWithEmployees(department.toObject());
          departments.push(depto);
        }
        resolve(careerAcronym === '' ? departments : departments.filter(
          dep=> dep.careers.filter(car=>car.acronym.toLowerCase() === careerAcronym.toLocaleLowerCase()).length > 0
        ));
      } else {
        resolve({err});
       
      }
    });
  });
};

const _getDepartmentWithEmployees = depto => {
  return new Promise(async resolve => {
    const employeesDepto = await _getEmployeesByDepartment(depto);
    depto.Employees = employeesDepto.employees;
    depto.boss = employeesDepto.boss;
    resolve(depto);
  })
};

const _getEmployeesByDepartment = (department) => {
  return new Promise(resolve => {
    _employee.find()
      .populate({
        path: 'positions.position', model: 'Position', select: 'name ascription',
        populate: { path: 'ascription', model: 'Department', select: 'name shortName' }
      })
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

const getDepartmentBossSecretary = (req, res) => {
  const {_departmentName} = req.params;
  const query = {
    name: { $regex: new RegExp(`^${_departmentName}$`) }
  };
  _department.findOne(query)
    .populate('careers')
    .then(async (department) => {
      if (department) {
        const positions = await _getPositionsByAscription(department._id);
        const employees = [];
        for (const position of positions) {
          employees.push(await _getEmployeeByPosition(position._id));
        }
        res.status(status.OK)
          .json({ department: employees });
      } else {
        res.status(status.NOT_FOUND)
          .json({ error: 'Ocurrió un error' });
      }
    })
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR)
      .json({ error: 'Ocurrió un error' }));
};

const _getPositionsByAscription = (departmentId) => {
  return new Promise(resolve => {
    const query = {
      $and: [
        { ascription: departmentId },
        {
          $or: [
            { name: {$regex: new RegExp(`^JEFE DE DEPARTAMENTO$`)}},
            { name: {$regex: new RegExp(`^SECRETARIA$`)}},
          ]
        }
      ]
    };
    _position.find(query)
      .then(positions => {
        if (positions && positions.length) {
          resolve(positions);
        } else {
          resolve([]);
        }
      })
      .catch(_ => resolve([]));
  });
};

const _getEmployeeByPosition = (positionId) => {
  return new Promise(resolve => {
    const query = {
      $and: [
        { 'positions.position': positionId },
        { positions: { $elemMatch: { status: 'ACTIVE' } } }
      ]
    };
    _employee.findOne(query)
      .then(employee => {
        if (employee) {
          resolve(employee);
        } else {
          resolve(null);
        }
      })
      .catch(_ => resolve(null));
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
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear departamento' }));
};

const updateDepartment = (req, res) => {
  const { _id } = req.params;
  const department = req.body;
  _department.updateOne({ _id: _id }, department)
    .then(updated => res.status(status.OK).json(updated))
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar departamento' }));
};

const removeDepartment = (req, res) => {
  const { _id } = req.params;
  _position.find({ ascription: _id })
    .then(positions => {
      if (!positions.length) {
        _department.deleteOne({ _id: _id })
          .then(deleted => res.status(status.OK).json(deleted))
          .catch(_ => res
            .status(status.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error al borrar departamento' }));
      } else {
        res
          .status(status.INTERNAL_SERVER_ERROR)
          .json({ message: 'El departamento tiene puestos asignados.' });
      }
    })
    .catch(err => res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: (err || 'Ocurrió un error').toString() }));
};

const searchEmployeeByPosition = (req, res) => {
  const data = req.body;  
  let query = [
    {
      $lookup: {
        from: "departments",
        localField: "ascription",
        foreignField: "_id",
        as: "Department"
      }
    },
    {
      $match: {
        "Department.name": data.Department
      }
    },
    {
      $group: {
        _id: '$Department.name',
        values: {
          $push: {
            id: '$_id', position: '$name'
          }
        }
      }
    }
  ];

  _position.aggregate(query, (error, department) => {
    if (error) {      
      return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
    }
    if (!department || department.length == 0) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Departamento no encontrado' });
    }
    const position = department[0].values.find(x => x.position === data.Position);
    _employee.findOne({ positions: { $elemMatch: { position: position.id, status: 'ACTIVE' } } }, (error, employee) => {
      if (error) {        
        return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
      }
      if (!employee) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Empleado no encontrado' });
      }
      res.status(status.OK);
      res.json({
        Employee: {
          name: employee.name.fullName, gender: employee.gender, position: data.position,
          department: data.department, grade: employee.grade
        }
      });
    })



  })
}
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
    searchEmployeeByPosition,
    consultAll,
    getDepartmentBossSecretary,
  });
};
