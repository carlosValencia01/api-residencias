const handler = require('../../utils/handler');
const status = require('http-status');


let _group;

const createGroup = (req, res) => { //Crear Grupo
    const group = req.body;
    _group.create(group)
      .then(created => res.status(status.OK).json(created))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Grupo' }));
};

const getAllGroup = (req, res) => { //Obtener todos los grupos
    _group.find({}).populate({
        path: 'course', model: 'EnglishCourse', select: {
            name: 1, _id: 0
        }
    }).populate({
        path: 'period', model: 'Period', select: {
            periodName: 1, year:1, _id: 0
        }
    }).exec(handler.handleMany.bind(null, 'groups', res));
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

module.exports = Group => {
    _group = Group;
    return ({
        createGroup,
        getAllGroup,
        getAllGroupOpened,
        getAllGroupOpenedByCourseAndLevel,
    });
};