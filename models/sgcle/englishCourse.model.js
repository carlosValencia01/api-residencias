const mongoose = require('mongoose');

const englishCourseSchema = new mongoose.Schema({
    
    name: {type: String},
    dailyHours: {type: String},         //Horas diarias
    totalHours: {type: String},         //Total de horas por semestre
    totalSemesters: {type: String},     //Cantidad de semestres por curso (niveles)
    finalHours: {type: String},         //Total de horas por curso (450 hr)
    status: {type: String},             //Si el curso sea nuevo,creado, habilitado (cuando ya tenga un horario), Suspendido.
    
});

const englishCourseModel = mongoose.model('EnglishCourse', englishCourseSchema, 'englishCourses');

module.exports = englishCourseModel;