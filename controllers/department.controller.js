const handler = require('../utils/handler');
const status = require('http-status');
let _department;


const getAll = (req, res) => {
  let query =
    [
      {
        $group: {
          _id: "$name",
          values:
          {
            $push: { id: '$_id', name: '$name' }
          }
        }
      }
    ];
  let query2 = [
    {
      $lookup:
      {
        from: 'employees',
        localField: "_id",
        foreignField: "deptoId",
        as: 'Employees'
      }
    }
    //, { $project: { 'name': 1, 'careers': 1, 'Employees.name': 1, 'Employees.position': 1, 'Employees.grade': 1, 'Employees.gradeMax': 1 } }
  ];
  _department.aggregate(query2).exec(handler.handleMany.bind(null, 'departments', res));
  //_department.find({}).exec(handler.handleMany.bind(null, 'departments', res));
};


module.exports = (Deparment) => {
  _department = Deparment;
  return ({
    getAll
  });
};