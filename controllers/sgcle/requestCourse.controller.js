const handler = require('../../utils/handler');
const status = require('http-status');


let _requestCourse;
let _englishStudent;
let _period;

// FIND METHODS
const getAllRequestCourse = (req, res) => {  
  _requestCourse.find({active:true}).populate({
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

const getRequestCourse = (req, res) => {
  _englishStudentId = req.params._id;
  _requestCourse.find({englishStudent:_englishStudentId}).populate({
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
  _requestCourse.find({$and:[{group:_id},{status: 'studying'}]})
      .exec(handler.handleMany.bind(null, 'requestCourses', res));
};

const getActiveRequestCourseByEnglishStudentId = async (req, res) => {
  const { _id } = req.params;
  const period = await getActivePeriod();
  let query = {
    englishStudent:_id,active:true
  };
  if(period){
    query['period'] = period._id;
  }
  _requestCourse.findOne(query).populate({
    path:'group', model:'Group',
    populate:{
      path:'course', model:'EnglishCourse'
    }
  }).populate({
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
        path:'teacher', model:'Employee'
      }
    }).populate({
      path:'group', model:'Group',
      populate:{
        path:'schedule.$.classroom', model:'Classroom'
      }
    })
      .exec(handler.handleMany.bind(null, 'requestCourse', res));
};

const getRequestedGroupRequests = (req, res) => {
  const { id } = req.params;

  _requestCourse
    .find({ group: id, status: 'requested', active: true })
    .populate({
      path: 'englishStudent', model: 'EnglishStudent',
      populate: {
        path: 'studentId', model: 'Student',
        select: 'fullName career controlNumber phone email'
      }
    })
    .populate({
      path: 'group', model: 'Group',
      populate: {
        path: 'course', model: 'EnglishCourse'
      }
    })
    .populate('period')
    .then((requests) => {
      res.status(status.OK)
        .json(requests);
    })
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR)
        .json(err || { error_msj: 'Ocurrió un erro' });
    });
};

const getActivePeriod = ()=>{
  return new Promise((resolve)=>{
    _period.findOne({active:true}).then(period=>resolve(period)).catch(err=>resolve(false));
  });
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

const activeRequestCourse = async (req, res) => {
  const groupId = req.body.groupId;
  const students = req.body.students;

  for(let i = 0; i < students.length; i++){
      // Actualizar groupId de las solicitudes por la del nuevo grupo activo
      _requestCourse.updateOne({_id:students[i]._id},{$set:{group:groupId,status:'studying'}})
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

const getAllRequestActiveCourse = (req, res) => {
  const { _id } = req.params;
  _requestCourse.find({group:_id}).populate({
    path: 'englishStudent', model: 'EnglishStudent',    
    populate: {
      path: 'studentId', model: 'Student',
      select: {
        careerId:1,controlNumber:1,fullName:1,email:1
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
const updateStatusToPaid = (req, res) => {
  const data  = req.body;

  data.forEach(async (st)=>{
      await new Promise((resolve)=>{            
        _requestCourse.updateOne({ englishStudent: st.englishStudent._id }, {paidNumber: 1, status:'paid'})
              .then(updated => resolve(true))
              .catch(_ => {console.log(_);resolve(false);});
      });
  });
  res.status(status.OK).json({message:'Status updated'})
};

const declineRequestActiveCourse = async (req, res) => {
  const groupOrignId = req.body.group.groupOrigin;
  const reqId = req.body._id;
  const studentId = req.body.englishStudent._id;

  _requestCourse.updateOne({_id:reqId},{$set:{group:groupOrignId,status:'paid'}})
  .then(updated => {
    if(updated){
      _englishStudent.updateOne({_id:studentId},{$set:{status:'waiting'}})
      .then(updated => {
        if(updated){
          return res.status(status.OK).json(true);
        }
      });
    }
  });
};

const AddRequestActiveCourse = async (req, res) => {
  const groupActiveId = req.body.activeGroup;
  const reqId = req.body.req._id;
  const studentId = req.body.req.englishStudent._id;

  _requestCourse.updateOne({_id:reqId},{$set:{group:groupActiveId,status:'studying'}})
  .then(updated => {
    if(updated){
      _englishStudent.updateOne({_id:studentId},{$set:{status:'studying'}})
      .then(updated => {
        if(updated){
          return res.status(status.OK).json(true);
        }
      });
    }
  });
};

// guardar las calificaciones de un grupo de forma masiva
const saveAverages = async (req, res) => {
  const students = req.body;

  for(let i = 0; i < students.length; i++){
      // datos de la solicitud a ser actualizados
      let query = {
        average: students[i].average,
        status: 'approved'
      };
      // comprobamos si se aprobo el bloque
      if(query.average < 70){
        query.status = 'not_approved';
      }
      await new Promise((resolve) => _requestCourse.updateOne({_id:students[i]._id},query).then(updated=>resolve(true)).catch(err=>resolve(false)));
      // datos del estudiante a ser actualizados
      let studentQuery = {
        level: students[i].level,
        status: 'no_choice'
      };
      // se comprueba si es el ultimo bloque del curso
      if(students[i].level.level == students[i].group.course.totalSemesters){
        studentQuery.status = query.status == 'approved' ?  'released' :'not_released';
      }
      await new Promise((resolve)=>{       
        _englishStudent.updateOne({_id:students[i].englishStudent},studentQuery)
        .then(created => resolve(true))
        .catch(err => {                    
            resolve(false)
        });
    });    
  }       
  return res.status(status.OK).json({msg:'Calificaciones registradas'});
};

  module.exports = (RequestCourse, EnglishStudent, Period) => {
    _requestCourse = RequestCourse;
    _englishStudent = EnglishStudent;
    _period = Period;
    return ({
      getAllRequestCourse,
      getRequestCourse,
      createRequestCourse,
      getAllRequestCourseByCourseAndRequested,
      updateRequestCourseById,
      updateRequestCourseByStudentId,
      getAllRequestCourseByCourseAndStudying,
      activeRequestCourse,
      getActiveRequestCourseByEnglishStudentId,
      getRequestedGroupRequests,
      getAllRequestActiveCourse,
      declineRequestActiveCourse,
      AddRequestActiveCourse,
      updateStatusToPaid,
      saveAverages,
    });
  };