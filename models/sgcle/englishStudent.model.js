const mongoose = require('mongoose');

const englishStudentSchema = new mongoose.Schema({

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    currentPhone: { type: String, trim: true }, // Teléfono actual
    // cancelled: cancelado por el estudiante
    // studying: cursando, not_released: no liberado, released: liberado
    status: { type: String, default: 'no_choice',
        enum: ['no_choice', 'waiting', 'studying', 'not_released', 'released'] },
    totalHoursCoursed: { type: Number }, // Avance en horas
    courseType: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishCourse' }, // Tipo de curso elegido
    level: { type: Number }, // Último nivel cursado-aprobado
    verified: {type: Boolean, default: true},

    // Datos del último bloque cursado
    lastLevelInfo: {
        startHour: { type: Number }, // En minutos
        endHour: { type: Number }, // En minutos
        teacher: { type: String, trim: true, uppercase: true },
        period: { type: String, trim: true, uppercase: true },
    }
});

const englishStudentModel = mongoose.model('EnglishStudent', englishStudentSchema, 'englishStudents');

module.exports = englishStudentModel;
