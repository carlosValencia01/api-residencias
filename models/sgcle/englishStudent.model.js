const mongoose = require('mongoose');

const englishStudentSchema = new mongoose.Schema({

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    currentPhone: { type: String, trim: true }, // Teléfono actual
    // cancelled: cancelado por el estudiante
    // studying: cursando, not_released: no liberado, released: liberado
    status: { type: String, enum: ['cancelled', 'studying', 'not_released', 'released'] },
    totalHoursCoursed: { type: Number }, // Avance en horas
    courseType: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishCourse' }, // Tipo de curso elegido
    level: { type: Number }, // Último nivel cursado-aprobado
});

const englishStudentModel = mongoose.model('EnglishStudent', englishStudentSchema, 'englishStudents');

module.exports = englishStudentModel;
