const handler = require('../../utils/handler');
const status = require('http-status');


let _group;
let _englishStudent;
let _requestCourse;

const createGroup = (req, res) => { //Crear Grupo
    const group = req.body;
    _group.create(group)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Grupo' }));
};

const assignGroupEnglishTeacher = (req, res) => {
    const { id } = req.params;
    const { teacher } = req.body;

    _group.updateOne({ _id: id }, { $set: { teacher } })
        .then((updated) => {
            if (!updated || (updated && !updated.n)) {
                return res.status(status.NOT_FOUND)
                    .json({ error_msj: 'No se encontró el grupo' });
            }
            res.status(status.OK).json({ ok_msj: 'Docente asignado con éxito' });
        })
        .catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json(err || { error_msj: 'Ocurrió un error' });
        });
};

const getAllGroup = async (req, res) => { //Obtener todos los grupos
    _group.find().populate({
        path: 'course', model: 'EnglishCourse', select: {
            name: 1, _id: 1
        }
    }).populate({
        path: 'period', model: 'Period', select: {
            periodName: 1, year:1, _id: 1
        }
    }).populate({        
        path: 'teacher', model: 'Employee', select: {
            name: 1, email:1, _id: 1
        }
    }).then( async (_groups) => {
        if(_groups){
            const newGroup = await Promise.all(_groups.map( async (_group) => ({
                    "_id": _group._id,
                    "name": _group.name,
                    "status": _group.status,
                    "schedule": _group.schedule,
                    "level": _group.level,
                    "period": _group.period,
                    "course": _group.course,
                    "teacher": _group.teacher,
                    "reqCount" : await getReqsCourse(_group._id)            
                })));
            return res.status(status.OK).json({ groups: newGroup });
        }
        return res.status(status.INTERNAL_SERVER_ERROR).json({message: 'Error al obtener los grupos'});
    });
};

const getAllGroupOpenedByCourseAndLevel = (req, res) => { //Obtener todos los grupos abiertos de acuerdo al curso y nivel
    const courseId = req.query.courseId;
    const level =  req.query.level;
    _group.find({status: 'opened', level: level, course: courseId})
        .exec(handler.handleMany.bind(null, 'groups', res));
};

const getAllGroupOpened = (req, res) => { //Obtener todos los grupos abiertos para demanda
    _group.find({status: 'opened'})
        .exec(handler.handleMany.bind(null, 'groups', res));
};

function getReqsCourse(_groupId){
    return new Promise((resolve) => {
        _requestCourse.find({ $or: [ { $and:[{group:_groupId},{status: 'requested'}] }, { $and:[{group:_groupId},{status: 'paid'}]}]}).then(req => {
            if(req){
                resolve(req.length);
            }
            resolve(0);
        });
    });
};

const getPaidStudentsCourse = async (req, res) => { //Obtener todos los grupos
    const _groupId = req.params._groupId;
    _requestCourse.find({$and:[{group:_groupId},{status: 'paid'}]}).populate({
        path: 'englishStudent', match: { status: 'waiting' } , model: 'EnglishStudent', 
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
    })
    .then(req => {
        if(req){
            const result = req.filter(r => r.englishStudent);
            return res.status(status.OK).json({students:result});
        }
        resolve(0);
    });
};



module.exports = (Group,EnglishStudent,RequestCourse) => {
    _group = Group;
    _englishStudent = EnglishStudent;
    _requestCourse = RequestCourse;
    return ({
        createGroup,
        assignGroupEnglishTeacher,
        getAllGroup,
        getAllGroupOpened,
        getAllGroupOpenedByCourseAndLevel,
        getPaidStudentsCourse,
    });
};