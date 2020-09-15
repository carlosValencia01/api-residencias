const mongoose = require('mongoose');

let controlStudent = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    controlNumber: { type: String, unique: true, trim: true },
    releaseAssistanceDate: { type: Date },
    emailStudent: { type: String },
    verification: {
        assistance: { type: Boolean },
        code: { type: Number },
        sendEmailCode: { type: Boolean, default: false},
        verificationEmail: { type: Boolean, default: false },
        solicitude: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] }
    },
    verificationDepartment: {
        information: { type: Boolean }
    },
    status: { type: String, default: 'solicitude', enum: ['solicitude', 'confirm', 'initial', 'approved'] },
    dependencyName: { type: String },
    dependencyPhone: { type: String },
    dependencyAddress: { type: String },
    dependencyHeadline: { type: String },
    dependencyHeadlinePosition: { type: String },
    dependencyDepartment: { type: String },
    dependencyDepartmentManager: { type: String },
    dependencyDepartmentManagerEmail: { type: String },
    dependencyProgramName: { type: String },
    dependencyProgramModality: { type: String },
    initialDate: { type: Date },
    dependencyActivities: { type: String },
    dependencyProgramType: { type: String },
    dependencyProgramObjective: { type: String },
    dependencyProgramLocationInside: { type: Boolean },
    dependencyProgramLocation: { type: String }
});

const controlStudentModel = mongoose.model('ControlStudent', controlStudent, 'controlStudents');

module.exports = controlStudentModel;
