const mongoose = require('mongoose');

const englishCourseSchema = new mongoose.Schema({

    name: { type: String, trim: true, required: true }, // Curso: PRACTICAL TIGER
    dailyHours: { type: Number },         // Horas diarias
    semesterHours: { type: Number },      // Total de horas por semestre
    totalSemesters: { type: Number },     // Cantidad de semestres del curso (niveles)
    totalHours: { type: Number },         // Total de horas del curso (450 hr)
    startPeriod: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' }, // Periodo de creación del curso
    endPeriod: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' }, // Último periodo en el que estará disponible
    status: { type: String, default: 'active', enum: ['active', 'inactive'] }, // Estatus del curso, activo o inactivo
    payment:{
        payments: { type: Number },
        pay: { type: Number },
      }
});

const englishCourseModel = mongoose.model('EnglishCourse', englishCourseSchema, 'englishCourses');

module.exports = englishCourseModel;
