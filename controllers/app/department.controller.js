const handler = require('../../utils/handler');
let _department;

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

module.exports = (Deparment) => {
  _department = Deparment;
  return ({
    getAll,
    getAllDepartments,
  });
};
