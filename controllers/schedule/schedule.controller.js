const handler = require('../../utils/handler');
const status = require('http-status');
let _student;
let _schedule;

const findStudentSchedule = async (req,res)=>{
    const _idStudent = req.params._idStudent;
    _schedule.findOne({studentId: _idStudent})
    .then(s => {
        if (s) {
            return res.status(status.OK).json({student:s});
        } else {
            return res.status(status.NOT_FOUND).json({student:''});
        }
    });
};

module.exports = (Student, Schedule) => {
  _student = Student;
  _schedule = Schedule;
  return ({
    findStudentSchedule,
  });
};