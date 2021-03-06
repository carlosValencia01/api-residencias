const handler = require('../../utils/handler');
const status = require('http-status');


let _englishCourse;
let _enBossMessage;

const createEnglishCourse = (req, res) => {
    const englishCourse = req.body;
    _englishCourse.create(englishCourse)
        .then(created => res.status(status.OK).json(created))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear el curso de Ingles' }));
};

const getAllEnglishCourse = (req, res) => {
    _englishCourse.find()
        .exec(handler.handleMany.bind(null, 'englishCourses', res));
};

const getEnglishCourseTwoPayments = (req, res) => {
    _englishCourse.find({"payment.payments":2},{_id:1})
        .exec(handler.handleMany.bind(null, 'englishCourses', res));
};

const getAllEnglishCourseActive = (req, res) => {
    _englishCourse.find({status: 'active'})
        .exec(handler.handleMany.bind(null, 'englishCourses', res));
};

const updateEnglishCourse = (req, res) => {
    const { _id } = req.params;
    const course = req.body;
    _englishCourse.updateOne({ _id: _id }, { $set: course })
        .then(updated => res.status(status.OK).json(updated))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el curso' }));
};

// BOSS MESSAGE MODEL
const getEnBossMessage = (req,res)=>{
    _enBossMessage.find({}).then((messages)=>{
        if(messages.length>0){
            return res.status(status.OK).json({message:messages[0]});
        }
        return res.status(status.BAD_REQUEST).json({error: 'Mensaje no encontrado'});
    }).catch((error)=>res.status(status.BAD_REQUEST).json({error}));
};

const createEnBossMessage = (req,res)=>{
    const {message} = req.body;
    _enBossMessage.create({message}).then((created)=>{
        _enBossMessage.find({}).then((messages)=>{
            return res.status(status.OK).json({message:messages[0]});
        })        
    }).catch((error)=>res.status(status.BAD_REQUEST).json({error}));
};

const updateEnBossMessage = (req,res)=>{
    const {_id} = req.params;
    const {message} = req.body;
    _enBossMessage.updateOne({_id},{message}).then((updated)=>{
        return res.status(status.OK).json({message});
    }).catch((error)=>res.status(status.BAD_REQUEST).json({error}));
};


module.exports = (EnglishCourse, EnBossMessage) => {
    _englishCourse = EnglishCourse;
    _enBossMessage = EnBossMessage;
    return ({
        createEnglishCourse,
        getAllEnglishCourse,
        getEnglishCourseTwoPayments,
        getAllEnglishCourseActive,
        updateEnglishCourse,
        getEnBossMessage,
        createEnBossMessage,
        updateEnBossMessage
    });
};