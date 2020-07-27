const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {type: String},
    available: {type: String, enum: ['Disponible', 'Ocupado']},
});

const classroomModel = mongoose.model('Classroom', classroomSchema, 'classrooms');

module.exports = classroomModel;