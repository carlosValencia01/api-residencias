const handler = require('../../utils/handler');
const status = require('http-status');


let _englishCourse;

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

const getAllEnglishCourseActive = (req, res) => {
    _englishCourse.find({status: 'active'})
        .exec(handler.handleMany.bind(null, 'englishCourses', res));
};

module.exports = EnglishCourse => {
    _englishCourse = EnglishCourse;
    return ({
        createEnglishCourse,
        getAllEnglishCourse,
        getAllEnglishCourseActive
    });
};