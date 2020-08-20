const handler = require('../../utils/handler');
const status = require('http-status');


let _requestCourse;
// FIND METHODS
const getAllRequestCourse = (req, res) => {
  _requestCourse.find({}).populate({
    path: 'englishStudent', model: 'EnglishStudent',    
    populate: {
        path: 'studentId', model: 'Student',
        select: {
          careerId:1,controlNumber:1,fullName:1
        },
        populate: {
            path: 'careerId', model: 'Career',
            select:{
              _id:0
            }          
        }
    }
}).populate({
  path:'group', model:'Group',
  populate:{
    path:'course', model:'EnglishCourse'
  }
})
      .exec(handler.handleMany.bind(null, 'requestCourses', res));
};

const getAllRequestCourseByCourseAndRequested = (req, res) => {
  const { _id } = req.params;
  _requestCourse.find({group: _id, status: 'requested'})
      .exec(handler.handleMany.bind(null, 'requestCourses', res));
};

const getAllRequestCourseByCourseAndStudying = (req, res) => {
  const { _id } = req.params;
  _requestCourse.find({group: _id, status: 'studying'})
      .exec(handler.handleMany.bind(null, 'requestCourses', res));
};

const getRequestCourseByEnglishStudentId = (req, res) => {
  const { _id } = req.params;
  _requestCourse.find({englishStudent: _id}).populate({
    path:'group', model:'Group',
    populate:{
      path:'course', model:'EnglishCourse'
    }
  })
      .exec(handler.handleMany.bind(null, 'requestCourse', res));
};

//END FIND METHODS

const createRequestCourse = (req, res) => { //Crear Solicitud
  const data = req.body;
  _requestCourse.create(data)
    .then(created => res.status(status.OK).json(created))
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Solicitud' }));
};

const updateRequestCourseById = (req, res) => { //Modificar Solicitud por ID de solicitud
  const { _id } = req.params;
  const data = req.body;
  _requestCourse.updateOne({_id:_id},{$set:data})
    .then(updated => res.status(status.OK).json(updated))
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al modificar Solicitud' }));
};

const updateRequestCourseByStudentId = (req, res) => { //Modificar Solicitud por ID del estudiante de Ingles
  const { _id } = req.params;
  const data = req.body;
  _requestCourse.updateOne({englishStudent:_id},{$set:data},{ sort: { requestDate: -1 } })
    .then(updated => res.status(status.OK).json(updated))
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al modificar Solicitud' }));
};

  module.exports = RequestCourse => {
    _requestCourse = RequestCourse;
    return ({
      getAllRequestCourse,
      createRequestCourse,
      getAllRequestCourseByCourseAndRequested,
      updateRequestCourseById,
      updateRequestCourseByStudentId,
      getAllRequestCourseByCourseAndStudying,
      getRequestCourseByEnglishStudentId
    });
  };