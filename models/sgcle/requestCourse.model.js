const mongoose = require('mongoose');

const requestCourseSchema = new mongoose.Schema({

    englishStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishStudent' }, // Estudiante 
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Grupo del nivel cursado
    status: {
        type: String, default: 'requested',
        // requested: solicitado, rejected: rechazado, studying: cursando,
        // finalized: terminado, approved: nivel aprobado, not_approved: nivel no aprobado
        // paid: curso pagado, not_paid: curso sin pagar
        enum: ['requested', 'rejected', 'studying', 'finalized', 'approved', 'not_approved','paid','not_paid']
    }, // Estatus del nievel cursado
    average: { type: String, trim: true }, // Promedio del nivel cursado
    requestDate: { type: Date, default: new Date() }, // Fecha de solicitud
    level: { type: Number }, // Nivel a cursar,
    rejectMessage: {type: String}, // mensaje de observacion al rechazar la solicitud
    period:{type: mongoose.Schema.Types.ObjectId, ref: 'Period' }, // periodo en que se hizo la solicitud
    paidNumber: {type: Number}, // número de pagos realizados
    active: {type: Boolean, default: true} // para identificar cual solicitud es la activa
});

const requestCourseModel = mongoose.model('RequestCourse', requestCourseSchema, 'requestCourses');

module.exports = requestCourseModel;
