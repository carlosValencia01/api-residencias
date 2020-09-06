const mongoose = require('mongoose');

let controlStudent = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    controlNumber: { type: String, unique: true, trim: true },
    releaseAssistanceDate: { type: Date }
});

const controlStudentModel = mongoose.model('ControlStudent', controlStudent, 'controlStudents');

module.exports = controlStudentModel;
