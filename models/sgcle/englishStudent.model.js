const mongoose = require('mongoose');

const englishStudentSchema = new mongoose.Schema({
    studentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    actualPhone: {type: String},
    status: {type: String, enum: ['Sin elección de Curso', 'Solicitud de Curso enviada', 'Cursando Ingles']},
    totalHoursCoursed: {type:Number},
});

const englishStudentModel = mongoose.model('sgcle-englishStudent', englishStudentSchema, 'sgcle-englishStudents');

module.exports = englishStudentModel;