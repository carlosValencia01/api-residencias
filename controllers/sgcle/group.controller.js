const handler = require('../../utils/handler');
const status = require('http-status');
// Importar el archivo donde se emiten los eventos
const _socket = require('../../sockets/app.socket');

// Importar el archivo de los enumeradores
const eSocket = require('../../enumerators/shared/sockets.enum');
const DEFAULT_ERROR_MSJ = 'Ocurrió un error';

let _group;
let _englishStudent;
let _requestCourse;
let _RequestCourseCtrl;
let _classroom;;

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

/* 
  Asignar aula en horario correspodiente de un grupo y
  actualizar horario del aula con los nuevos segmentos
  ocupados por el horario del grupo.
  Nota: La operación se realiza por día
 */
const assignGroupClassroom = (req, res) => {
    const { id } = req.params;
    const { schedule, classroom } = req.body;
    const { startHour, endDate, day, classroom: beforeClassroom } = schedule;

    _group
        .updateOne(
            { _id: id, 'schedule._id': schedule._id },
            { $set: { 'schedule.$.classroom': classroom } })
        .then(async (updated) => {
            if (!updated || (updated && !updated.n)) {
                return null;
            }

            // Poner disponibles los segmentos del horario de la antigua aula, si ya tenía aula asignada
            if (beforeClassroom && beforeClassroom._id) {
                const beforeClassroomSchedule = (await _classroom.findOne({ _id: beforeClassroom._id })).toObject().schedule;
                const beforeClassroomNewSchedule = beforeClassroomSchedule.map((item) => {
                    if (item.day === day && item.startHour >= startHour &&
                        item.endDate <= endDate && item.status === 'occupied') {
                        item.status = 'available';
                    }
                    return item;
                });
                return _classroom.updateOne({ _id: beforeClassroom._id }, { $set: { schedule: beforeClassroomNewSchedule } });
            }
            return { n: 1 };
        })
        .then(async (updated) => {
            if (!updated || (updated && !updated.n)) {
                return null;
            }

            // Poner como ocupados los segmentos del horario de la nueva aula
            const schedule = (await _classroom.findOne({ _id: classroom })).toObject().schedule;
            const newSchedule = schedule.map((item) => {
                if (item.day === day && item.startHour >= startHour &&
                    item.endDate <= endDate && item.status === 'available') {
                    item.status = 'occupied';
                }
                return item;
            });
            return _classroom.updateOne({ _id: classroom }, { $set: { schedule: newSchedule } });
        })
        .then((updated) => {
            if (!updated || (updated && !updated.n)) {
                return null;
            }
            return _group.findOne({ _id: id })
                .populate({ path: 'schedule.classroom', model: 'Classroom' });
        })
        .then((group) => {
            if (!group) {
                return res.status(status.NOT_FOUND)
                    .json({ error_msj: DEFAULT_ERROR_MSJ });
            }
            res.status(status.OK)
                .json({
                    ok_msj: 'Aula asignada con éxito',
                    schedule: group.schedule,
                });
        })
        .catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json(err || { error_msj: DEFAULT_ERROR_MSJ });
        });
};

const getAllGroup = async (req, res) => { // Obtener todos los grupos
    _group.find()
        .populate({
            path: 'course', model: 'EnglishCourse', select: {
                name: 1, _id: 1
            }
        })
        .populate({
            path: 'period', model: 'Period', select: {
                periodName: 1, year: 1, _id: 1
            }
        })
        .populate({
            path: 'teacher', model: 'Employee', select: {
                name: 1, email: 1, _id: 1
            }
        })
        .populate({ path: 'schedule.classroom', model: 'Classroom' })
        .then(async (_groups) => {
            if (_groups) {
                const newGroup = await Promise.all(_groups.map(async (_group) => ({
                    "_id": _group._id,
                    "name": _group.name,
                    "status": _group.status,
                    "schedule": _group.schedule,
                    "level": _group.level,
                    "period": _group.period,
                    "course": _group.course,
                    "groupOrigin": _group.groupOrigin ? _group.groupOrigin : '',
                    "teacher": _group.teacher,
                    "reqCount": await getReqsCourse(_group._id),
                    "reqActCount": await getReqsActCourse(_group._id),
                    "numberStudents": await getReqsNumber(_group._id),
                })));
                return res.status(status.OK).json({ groups: newGroup });
            }
            return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los grupos' });
        });
};

const getGroupById = async (req, res) => { // Obtener grupo por id
    _group.findOne({ _id: req.params.groupId }).populate({
        path: 'course', model: 'EnglishCourse', select: {
            name: 1, _id: 1
        }
    }).populate({
        path: 'period', model: 'Period', select: {
            periodName: 1, year: 1, _id: 1
        }
    }).populate({
        path: 'teacher', model: 'Employee', select: {
            name: 1, email: 1, _id: 1
        }
    }).then(async (_group) => {
        if (_group) {
            const newGroup = {
                "_id": _group._id,
                "name": _group.name,
                "status": _group.status,
                "schedule": _group.schedule,
                "level": _group.level,
                "period": _group.period,
                "course": _group.course,
                "groupOrigin": _group.groupOrigin ? _group.groupOrigin : '',
                "teacher": _group.teacher,
                "reqCount": await getReqsCourse(_group._id),
                "reqActCount": await getReqsActCourse(_group._id)
            };
            return res.status(status.OK).json({ group: newGroup });
        }
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener el grupo' });
    });
};

const getAllGroupOpenedByCourseAndLevel = (req, res) => { //Obtener todos los grupos abiertos de acuerdo al curso y nivel
    const courseId = req.query.courseId;
    const level = req.query.level;
    _group.find({ status: 'opened', level: level, course: courseId })
        .exec(handler.handleMany.bind(null, 'groups', res));
};

const getAllGroupOpened = (req, res) => { //Obtener todos los grupos abiertos para demanda
    _group.find({ status: 'opened' })
        .exec(handler.handleMany.bind(null, 'groups', res));
};

function getReqsCourse(_groupId) {
    return new Promise((resolve) => {
        _requestCourse.find({ $or: [{ $and: [{ group: _groupId }, { status: 'requested' }] }, { $and: [{ group: _groupId }, { status: 'paid' }] }] }).then(req => {
            if (req) {
                resolve(req.length);
            }
            resolve(0);
        });
    });
};

function getReqsNumber(_groupId) {
    return new Promise((resolve) => {
        _requestCourse.find({ group: _groupId }).then(req => {
            if (req) {
                resolve(req.length);
            }
            resolve(0);
        });
    });
};

function getReqsActCourse(_groupId) {
    return new Promise((resolve) => {
        _requestCourse.find({ $and: [{ group: _groupId }, { status: 'studying' }] }).then(req => {
            if (req) {
                resolve(req.length);
            }
            resolve(0);
        });
    });
};

const getPaidStudentsCourse = async (req, res) => { //Obtener todos los grupos
    const _groupId = req.params._groupId;
    _requestCourse.find({ $and: [{ group: _groupId }, { status: 'paid' }] }).populate({
        path: 'englishStudent', match: { status: 'waiting' }, model: 'EnglishStudent',
        populate: {
            path: 'studentId', model: 'Student',
            select: {
                careerId: 1, controlNumber: 1, fullName: 1
            },
            populate: {
                path: 'careerId', model: 'Career',
                select: {
                    _id: 0
                }
            }
        }
    })
        .then(req => {
            if (req) {
                const result = req.filter(r => r.englishStudent);
                return res.status(status.OK).json({ students: result });
            }
            resolve(0);
        });
};

const getAllGroupByTeacher = async (req, res) => {
    const { _teacherId, clientId } = req.params;
    const groups = await consultAllGroupByTeacher(_teacherId);
    if (!groups) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener los grupos' });
    }
    _socket.singleEmit(eSocket.englishEvents.GET_ALL_GROUP_BY_TEACHER, groups, clientId);
    return res.status(status.OK).json(groups);
};

const consultAllGroupByTeacher = (_teacherId) => {
    return new Promise((resolve) => {
        _group.find({ teacher: _teacherId })
            .populate({
                path: 'course', model: 'EnglishCourse', select: {
                    name: 1, _id: 1
                }
            })
            .populate({
                path: 'period', model: 'Period', select: {
                    periodName: 1, year: 1
                }
            })
            .then(async (_groups) => {
                if (_groups) {
                    const newGroups = await Promise.all(_groups.map(async (_group) => ({
                        "_id": _group._id,
                        "name": _group.name,
                        "status": _group.status,
                        "schedule": _group.schedule,
                        "level": _group.level,
                        "period": _group.period,
                        "course": _group.course,
                        "groupOrigin": _group.groupOrigin ? _group.groupOrigin : '',
                        "teacher": _group.teacher,
                        "reqCount": await getReqsCourse(_group._id),
                        "reqActCount": await getReqsActCourse(_group._id),
                        "numberStudents": await getReqsNumber(_group._id)
                    })));
                    return resolve({ groups: newGroups });
                }
                return resolve(false);
            });
    });
}

// guardar las calificaciones de un grupo de forma masiva
const saveAverages = async (req, res) => {
    const students = req.body.studentsToUploadAvg;
    const groupId = req.body.groupId;
    const teacherId = req.body.teacherId;
    for (let i = 0; i < students.length; i++) {
        // datos de la solicitud a ser actualizados
        let query = {
            average: students[i].average,
            status: 'approved'
        };
        // comprobamos si se aprobo el bloque
        if (query.average < 70) {
            query.status = 'not_approved';
        }
        await new Promise((resolve) => _requestCourse.updateOne({ _id: students[i]._id }, query).then(updated => resolve(true)).catch(err => resolve(false)));
        // datos del estudiante a ser actualizados
        let studentQuery = {
            level: query.status == 'approved' ? students[i].level : students[i].englishStudent_level,
            status: 'no_choice'
        };
        // se comprueba si es el ultimo bloque del curso
        if (students[i].level == students[i].group.course.totalSemesters) {
            studentQuery.status = 'not_released';
        }
        await new Promise((resolve) => {
            _englishStudent.updateOne({ _id: students[i].englishStudent }, studentQuery)
                .then(created => resolve(true))
                .catch(err => {
                    resolve(false)
                });
        });
    }
    const requestCourses = await _RequestCourseCtrl.consultAllRequestActiveCourse(groupId);
    await verifyIsGroupIsEvaluated(groupId, requestCourses);
    const groups = await consultAllGroupByTeacher(teacherId);
    console.log(groups);
    _socket.broadcastEmit(eSocket.englishEvents.GET_ALL_REQUEST_ACTIVE_COURSE, requestCourses);
    _socket.broadcastEmit(eSocket.englishEvents.GET_ALL_GROUP_BY_TEACHER, groups);
    return res.status(status.OK).json({ msg: 'Calificaciones registradas' });
};

// guarda la calificacion de un alumno
const saveSingleAverage = async (req, res) => {
    const { studentQuery, requestQuery, request, groupId, teacherId } = req.body;
    await _requestCourse.updateOne({ _id: request._id }, requestQuery).then((updated => { })).catch((error) => { });
    await _englishStudent.updateOne({ _id: request.englishStudent._id }, studentQuery).then((updated => { })).catch((error) => { });
    const requestCourses = await _RequestCourseCtrl.consultAllRequestActiveCourse(groupId);
    await verifyIsGroupIsEvaluated(groupId, requestCourses);
    const groups = await consultAllGroupByTeacher(teacherId);
    _socket.broadcastEmit(eSocket.englishEvents.GET_ALL_REQUEST_ACTIVE_COURSE, requestCourses);
    _socket.broadcastEmit(eSocket.englishEvents.GET_ALL_GROUP_BY_TEACHER, groups);
    res.json({ msg: 'Calificación registrada' });
};

const verifyIsGroupIsEvaluated = (groupId, requests) => {
    return new Promise(async (resolve) => {
        const evaluatedStudents = requests.requestCourses.filter(req => req.average);
        if (evaluatedStudents.length == requests.requestCourses.length) { // all request have average
            // change group status to evaluated
            await _group.updateOne({ _id: groupId }, { status: 'evaluated' }).then(group => {
                resolve(true);
            });
        }
        resolve(true);
    });
};

module.exports = (Group, EnglishStudent, RequestCourse, Classroom) => {
    _group = Group;
    _englishStudent = EnglishStudent;
    _requestCourse = RequestCourse;
    _classroom = Classroom;
    _RequestCourseCtrl = require('../../controllers/sgcle/requestCourse.controller')(RequestCourse, EnglishStudent, null);

    return ({
        createGroup,
        assignGroupEnglishTeacher,
        assignGroupClassroom,
        getAllGroup,
        getAllGroupOpened,
        getAllGroupOpenedByCourseAndLevel,
        getPaidStudentsCourse,
        getAllGroupByTeacher,
        getGroupById,
        saveAverages,
        saveSingleAverage,
    });
};
