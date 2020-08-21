const mongoose = require('mongoose');

const englishStudentSchema = new mongoose.Schema({

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    currentPhone: { type: String, trim: true }, // Teléfono actual
    // no_choice: sin elección, selected: grupo seleccionado, cancelled: cancelado por el estudiante
    // rejected: rechazado, studying: cursando, not_released: no liberado, released: liberado
    // paid: curso pagado
    status: { type: String, enum: ['no_choice', 'selected', 'cancelled', 'rejected', 'studying', 'not_released', 'released', 'paid'] },
    totalHoursCoursed: { type: Number }, // Avance en horas
    courseType: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishCourse' }, // Tipo de curso elegido
    level: { type: Number }, // Último nivel cursado-aprobado
    rejectMessage: {type: String}, // mensaje de observacion al rechazar la solicitud
    paidNumber: {type: Number, default:0}, // número de pagos realizados
    // Para estudiantes externos del tecnológico
    name: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true }
    },
    gender: { type: String, trim: true, enum: ['F', 'M'] },
    email: { type: String, trim: true },

});

const englishStudentModel = mongoose.model('EnglishStudent', englishStudentSchema, 'englishStudents');

module.exports = englishStudentModel;
