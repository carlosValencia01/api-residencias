const mongoose = require('mongoose');

let controlStudent = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    controlNumber: { type: String },
    fullName: { type: String }
});

const controlStudentModel = mongoose.model('ControlStudent', controlStudent, 'controlStudents');

module.exports = controlStudentModel;
