const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({

    // Consultar si necesita tener un historial de ocupación de las aulas por periodo
    name: { type: String, trim: true }, // Aula: UVP-01
    capacity: { type: Number }, // Cantidad máxima de alumnos
    schedule: [{ // Horario del aula
        day: { type: Number, enum: [1, 2, 3, 4, 5, 6] }, // 1:Lunes, 6:Sábado
        startHour: { type: Number }, // En minutos
        endDate: { type: Number }, // En minutos
        status: { // disponible, ocupado
            type: String, default: 'available',
            enum: ['available', 'occupied'],
        },
    }],

});

const classroomModel = mongoose.model('Classroom', classroomSchema, 'classrooms');

module.exports = classroomModel;
