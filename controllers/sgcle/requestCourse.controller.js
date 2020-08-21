const handler = require('../../utils/handler');
const status = require('http-status');


let _requestCourse;

const getAllRequestCourse = (req, res) => {
  _requestCourse.find({status:'requested'}).populate({
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
  _requestCourse.findOneAndUpdate({englishStudent:_id},{$set:data},{ sort: { requestDate: -1 } })
    .then(updated => res.status(status.OK).json(updated))
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al modificar Solicitud' }));
};

const activeRequestCourse = async (req, res) => {
  const groupId = req.body.groupId;
  const students = req.body.students;

  for(let i = 0; i < students.length; i++){
      // Actualizar groupId de las solicitudes por la del nuevo grupo activo
      _requestCourse.updateOne({_id:students[i]._id},{$set:{group:groupId}})
      .then(updated => {
        if(updated){
          // Cambiar estatus del alumno por studying
          _englishStudent.updateOne({_id:students[i].englishStudent._id},{$set:{status:'studying'}})
          .then(updated => {
            if(updated){

            }
          });
        }
      });
  }
  return res.status(status.OK).json(true);

  
};

  module.exports = (RequestCourse,EnglishStudent) => {
    _requestCourse = RequestCourse;
    _englishStudent = EnglishStudent;
    return ({
      getAllRequestCourse,
      createRequestCourse,
      getAllRequestCourseByCourseAndRequested,
      updateRequestCourseById,
      updateRequestCourseByStudentId,
      getAllRequestCourseByCourseAndStudying,
      activeRequestCourse
    });
  };