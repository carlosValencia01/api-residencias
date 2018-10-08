const handler = require('../utils/handler');
const status = require('http-status');

let _student;

const getAll = (req, res) => {
    _student.find({})
        .exec(handler.handleMany.bind(null, 'students', res));
};

module.exports = (Student) => {
    _student = Student;
    return ({
        getAll
    });
};
