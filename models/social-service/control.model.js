const mongoose = require('mongoose');

let controlStudent = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    controlNumber: { type: String, unique: true, trim: true, required: true },
    releaseAssistanceDate: { type: Date },
    emailStudent: { type: String },
    verification: {
        assistance: { type: Boolean, default: true },
        code: { type: Number },
        sendEmailCode: { type: Boolean, default: false },
        verificationEmail: { type: Boolean, default: false },
        workPlanProjectDownloaded: { type: Boolean, default: false},
        presentationDownloaded: { type: Boolean, default: false},
        presentationDateDownload: { type: Date },
        solicitude: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        presentation: { type: String, default: 'noAssigned', enum: ['noAssigned', 'assigned', 'sign', 'send', 'reevaluate', 'approved'] },
        acceptance: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        workPlanProject: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        constancy: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        commitment: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        report: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        cardControl: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        dependencyManagerAppraisal: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        lastReportAppraisal: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        selfAppraisal: { type: String, enum: ['send', 'reevaluate', 'approved'] },
        signs: {
            solicitude: {
                signStudentDate: { type: Date },
                signDepartmentDate: { type: Date },
                signDepartmentName: { type: String }
            },
            presentation: {
                signDepartmentDate: { type: Date },
                signDepartmentName: { type: String }
            }
        }
    },
    verificationDepartment: {
        solicitude: [
            {
                fieldName: { type: String },
                validation: { type: Boolean },
                message: { type: String }
            }
        ]
    },
    documents:[
        {
            filename: { type: String },
            releaseDate: { type: Date, default: new Date() },
            type: { type: String },
            fileIdInDrive:{ type: String },
            status:[
                {
                    name: { type: String }, // ServicioSocial:['EN PROCESO', 'RECHAZADO', 'VALIDADO', 'ACEPTADO']
                    active: { type: Boolean },
                    message:{ type: String },  // Se envio, Se actualizo, se rechazo, se valido, se acepto
                    date:{ type: Date, default: new Date() },
                    observation:{ type: String } //solo si fue rechazado
                }
            ]
        }
    ],
    status: { type: String, default: 'solicitude', enum: ['solicitude', 'approval', 'initial', 'approved'] },
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
    dependencyProgramType: {
        option: { type: String },
        value: { type: String }
    },
    dependencyProgramObjective: { type: String },
    dependencyProgramLocationInside: { type: Boolean },
    dependencyProgramLocation: { type: String },
    tradePresentationDocumentNumber: { type: String },
    schedule: [{type: String}],
    months: [{type: String}]
});

const controlStudentModel = mongoose.model('ControlStudent', controlStudent, 'controlStudents');

module.exports = controlStudentModel;


