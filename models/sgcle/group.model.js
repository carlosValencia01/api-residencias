const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({

  name: { type: String, trim: true, required: true }, // Nombre del grupo
  schedule: [{ // Horario del grupo
    day: { type: Number, enum: [1, 2, 3, 4, 5, 6] }, // 1:Lunes, 6:Sábado
    startHour: { type: Number }, // En minutos
    endDate: { type: Number }, // En minutos
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  }],
  level: { type: Number }, // Nivel del grupo en base al tipo de curso
  period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' }, // Periodo en que se abrió el grupo
  // opened: Abierto para demanda, active: Activo en clases, closed: Cerrado sin iniciar, finalized: Terminado
  status: { type: String, default: 'opened', enum: ['opened', 'active', 'closed', 'finalized'] }, // Estatus del curso
  minCapacity: { type: Number }, // Cantidad mínima de alumnos
  maxCapacity: { type: Number }, // Cantidad máxima de alumnos
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Docente del grupo
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EnglishCourse' }, // Tipo de curso del grupo

});

const groupModel = mongoose.model('Group', groupSchema, 'groups');

module.exports = groupModel;
