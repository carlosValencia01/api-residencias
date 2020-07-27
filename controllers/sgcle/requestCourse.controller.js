const handler = require('../../utils/handler');
const status = require('http-status');


let _requestCourse;

const getAllRequestCourse = (req, res) => {
  _requestCourse.find({})
      .exec(handler.handleMany.bind(null, 'requestCourses', res));
  };

const updateRequestCourse = (req, res) => {
  const request = req.body;
  const name = request.name;
  const period = request.period;
  const days = request.days;
  const hours = request.hours;
  const studentId = request.studentId

  _requestCourse.updateOne(
    {name: name, period: period},
    {$push: {"days.$[d].hours.$[h].students": studentId}},
    {arrayFilters:[{"d.desc": {$eq: days}},{"h.desc": {$eq: hours}}]}
    ).then(requestCourse => {
      
      if(!requestCourse || requestCourse.nModified==0){

        _requestCourse.updateOne(
          {name: name, period: period},
          {$push: {"days.$[d].hours": {desc: hours, students: [studentId]}}},
          {arrayFilters:[{"d.desc": {$eq: days}}]}
        ).then(requestCourse2 => {

          if(!requestCourse2 || requestCourse2.nModified==0){

            _requestCourse.updateOne(
              {name: name, period: period},
              {$push: {days: {desc: days, hours: [{desc: hours, students: [studentId]}]}}}
            ).then(requestCourse3 => {
              
              if(!requestCourse3 || (requestCourse3.nModified==0 && requestCourse3.n==0)){
                _requestCourse.create({name: name, period: period, days: {desc: days, hours: [{desc: hours, students: [studentId]}]}})
                .then(created => {
                  return res.status(status.OK).json(created)
                })
                .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear la solicitud de curso' }));
              }
              return res.status(status.OK).json({ requestCourse });

            }
            ).catch(_ => 
              res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al agregar estudiante, hora y día a la solicitud' })
            );

          }
          return res.status(status.OK).json({ requestCourse });

        }
        ).catch(_ => 
          res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al agregar estudiante y hora a la solicitud' })
        );
      }

      return res.status(status.OK).json({ requestCourse });
    }
    ).catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al agregar estudiante a la solicitud' }));

};

  const deleteRequestOfStudent = (req, res) => {

    const { _id } = req.params;
    const dayId = req.body.dayId;
    const hourId = req.body.hourId;
    const studentId = req.body.studentId;

    _requestCourse.updateOne(
      { _id: _id},
      {$pull : { "days.$[d].hours.$[h].students":  studentId}}, 
      {arrayFilters:[{"d._id": dayId}, {"h._id": hourId}]})
      .then(updated => res.status(status.OK).json(updated))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al eliminar la solicitud del estudiante' }));
  };

  module.exports = RequestCourse => {
    _requestCourse = RequestCourse;
    return ({
      getAllRequestCourse,
      updateRequestCourse,
      deleteRequestOfStudent,
    });
  };