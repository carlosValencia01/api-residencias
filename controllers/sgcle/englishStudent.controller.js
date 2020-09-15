const handler = require('../../utils/handler');
const status = require('http-status');

const getAllEnglishStudent = (req, res) => {
    _englishStudent.find({})
    .populate({
        path: 'studentId', model: 'Student', select: {
            fullName: 1, controlNumber: 1, career: 1, sex: 1, email: 1, phone: 1, _id: 0
        },
        populate: {
            path: 'careerId', model: 'Career',
            select:{
              _id:0
            }          
        }
    })
    .populate({ path: 'courseType', model: 'EnglishCourse' })
        .exec(handler.handleMany.bind(null, 'englishStudents', res));
    };

const createEnglishStudent = (req, res) => {
    const englishStudent = req.body;
    _englishStudent.create(englishStudent)
        .then(created => res.status(status.OK).json(created))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear el perfil del estudiante de Ingles' }));
};

const getEnglishStudentByStudentId = (req, res) => {
    const { _studentId } = req.params;
    _englishStudent.findOne({ studentId: _studentId })
        .populate({ path: 'courseType', model: 'EnglishCourse' }).populate({path: 'studentId', model: 'Student',
        select: {
          careerId:1,controlNumber:1,fullName:1
        },
        populate: {
            path: 'careerId', model: 'Career',
            select:{
              _id:0
            }          
        }})
        .exec(handler.handleOne.bind(null, 'englishStudent', res));
};

const getEnglishStudentAndStudentById = (req, res) => {
    const { _id } = req.params;
    _englishStudent.find({ _id: _id })
        .populate({
            path: 'studentId', model: 'Student', select: {
                fullName: 1, controlNumber: 1, career: 1, sex: 1, email: 1, phone: 1, _id: 0
            }
        })
        .populate({ path: 'courseType', model: 'EnglishCourse' })
        .exec(handler.handleOne.bind(null, 'englishStudent', res));
};

const updateEnglishStudent = (req, res) => {
    const { _id } = req.params;
    const englishStudent = req.body;
    _englishStudent.updateOne({ _id: _id }, englishStudent)
        .then(updated => res.status(status.OK).json(updated))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el perfil del estudiante de Ingles' }));
};


const updateStatus = (req, res) => {/*
    const { _id } = req.params;
    var s = "";
    console.log(req.body);
    switch(req.body.status) { 
        case "1": { 
           s="Sin elección de Curso";
           break; 
        } 
        case "2": { 
            s="Solicitud de Curso enviada";
           break; 
        } 
        case "3": { 
            s="Cursando Ingles";
           break; 
        } 
        default: { 
            res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar estatus del estudiante de Ingles' })
           break; 
        } 
     } 

    _englishStudent.updateOne({ _id: _id }, {$set: {status: s}})
      .then(updated => res.status(status.OK).json(updated))
      .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el perfil del estudiante de Ingles' }));
*/};

const getEnglishStudentNoVerified = (req, res) => {
    _englishStudent.find({ verified: false })
        .populate({
            path: 'studentId', model: 'Student', select: {
                fullName: 1, controlNumber: 1, career: 1, sex: 1, email: 1, phone: 1, _id: 0
            }
        })
        .populate({ path: 'courseType', model: 'EnglishCourse' })
        .exec(handler.handleOne.bind(null, 'englishStudent', res));
};

module.exports = (EnglishStudent, EnglishCourse) => {
    _englishStudent = EnglishStudent;
    _englishCourse = EnglishCourse;
    return ({
        createEnglishStudent,
        getEnglishStudentByStudentId,
        updateEnglishStudent,
        getEnglishStudentAndStudentById,
        updateStatus,
        getEnglishStudentNoVerified,
        getAllEnglishStudent,
    });
};