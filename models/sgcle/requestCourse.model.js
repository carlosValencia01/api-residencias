const mongoose = require('mongoose');

const requestCourseSchema = new mongoose.Schema({

    englishStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishStudent' }, // Estudiante 
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Grupo del nivel cursado
    status: {
        type: String, default: 'requested',
        // requested: solicitado, rejected: rechazado, studying: cursando,
        // finalized: terminado, approved: nivel aprobado, not_approved: nivel no aprobado
        enum: ['requested', 'rejected', 'studying', 'finalized', 'approved', 'not_approved']
    }, // Estatus del nievel cursado
    average: { type: String, trim: true }, // Promedio del nivel cursado
    requestDate: { type: Date, default: new Date() }, // Fecha de solicitud
    level: { type: Number }, // Nivel a cursar,
    rejectMessage: {type: String} // mensaje de observacion al rechazar la solicitud

});

const requestCourseModel = mongoose.model('RequestCourse', requestCourseSchema, 'requestCourses');

module.exports = requestCourseModel;
