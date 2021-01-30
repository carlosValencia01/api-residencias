const mongoose = require('mongoose');

let controlStudent = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    periodId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true },
    controlNumber: { type: String, unique: true, trim: true, required: true },
    releaseAssistanceDate: { type: Date },
    emailStudent: { type: String },
    historyDocumentStatus: [
        {
            name: { type: String },
            status: [
                {
                    name: { type: String },
                    message:{ type: String },
                    responsible: { type: String },
                    date:{ type: Date, default: new Date() }
                }
            ]
        }
    ],
    verification: {
        assistance: { type: Boolean, default: false },
        code: { type: Number },
        sendEmailCode: { type: Boolean, default: false },
        verificationEmail: { type: Boolean, default: false },
        workPlanProjectDownloaded: { type: Boolean, default: false},
        workPlanProjectDateDownload: { type: Date },
        presentationDownloaded: { type: Boolean, default: false},
        presentationDateDownload: { type: Date },
        solicitude: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        presentation: { type: String, default: 'noAssigned', enum: ['noAssigned', 'assigned', 'sign', 'send', 'reevaluate', 'approved'] },
        acceptance: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        workPlanProject: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        commitment: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        reports: [
            {
                position: { type: Number },
                name: { type: String },
                status: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
            }
        ],
        managerEvaluations: [
            {
                position: { type: Number },
                name: { type: String },
                status: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
                scores: {
                    q1: { type: Number, default: 0 },
                    q2: { type: Number, default: 0 },
                    q3: { type: Number, default: 0 },
                    q4: { type: Number, default: 0 },
                    q5: { type: Number, default: 0 },
                    q6: { type: Number, default: 0 },
                    q7: { type: Number, default: 0 },
                }
            }
        ],
        selfEvaluations: [
            {
                position: { type: Number },
                name: { type: String },
                status: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
                scores: {
                    qS1: { type: Number, default: 0 },
                    qS2: { type: Number, default: 0 },
                    qS3: { type: Number, default: 0 },
                    qS4: { type: Number, default: 0 },
                    qS5: { type: Number, default: 0 },
                    qS6: { type: Number, default: 0 },
                    qS7: { type: Number, default: 0 },
                }
            }
        ],
        //cardControl: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        constancy: { type: String, default: 'register', enum: ['register', 'firstSign', 'approved'] },
        lastReportEvaluation: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        lastReport: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        lastReportScores: [
            {
                qL1: { type: Number, default: 0 },
                qL2: { type: Number, default: 0 },
                qL3: { type: Number, default: 0 },
                qL4: { type: Number, default: 0 },
                qL5: { type: Number, default: 0 },
                qL6: { type: Number, default: 0 },
                qL7: { type: Number, default: 0 },
                qL8: { type: Number, default: 0 },
            }
        ],
        dependencyRelease: { type: String, default: 'register', enum: ['register', 'send', 'reevaluate', 'approved'] },
        signs: {
            solicitude: {
                signStudentDate: { type: Date },
                signDepartmentDate: { type: Date },
                signDepartmentName: { type: String }
            },
            presentation: {
                signDepartmentDate: { type: Date },
                signDepartmentName: { type: String }
            },
            constancy: {
                signDepartmentDate: { type: Date },
                signDepartmentName: { type: String },
                signSubPrincipalDate: { type: Date },
                signSubPrincipalName: { type: String }
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
        ],
        presentation: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        acceptance: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        workPlanProject: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        commitment: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        dependencyRelease: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        reports: [
            {
                filename: { type: String },
                validation: { type: Boolean },
                message: { type: String },
                date: { type: Date, default: new Date()}
            }
        ],
        managerEvaluations: [
            {
                filename: { type: String },
                validation: { type: Boolean },
                message: { type: String },
                date: { type: Date, default: new Date()}
            }
        ],
        selfEvaluations: [
            {
                filename: { type: String },
                validation: { type: Boolean },
                message: { type: String },
                date: { type: Date, default: new Date()}
            }
        ],
        lastReport: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        },
        lastReportEvaluation: {
            validation: { type: Boolean },
            message: { type: String },
            date: { type: Date }
        }
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
    status: { type: String, default: 'solicitude', enum: ['solicitude', 'process', 'preAssigned', 'preSign', 'approved'] },
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
    dependencyInitialDate: { type: Date },
    dependencyActivities: { type: String },
    dependencyProgramType: {
        option: { type: String },
        value: { type: String }
    },
    dependencyProgramObjective: { type: String },
    dependencyProgramLocationInside: { type: Boolean },
    dependencyProgramLocation: { type: String },
    tradePresentationDocumentNumber: { type: String },
    tradeConstancyDocumentNumber: { type: String },
    performanceLevelConstancyDocument: { type: String },
    schedule: [{type: String}],
    months: [{type: String}],
    studentPhone: { type: String },
    studentGender: { type: String },
    studentStreet: { type: String },
    studentSuburb: { type: String },
    studentZip: { type: String },
    studentCity: { type: String },
    studentState: { type: String },
    stepWizard: {type:Number, default: 0}
});

const controlStudentModel = mongoose.model('ControlStudent', controlStudent, 'controlStudents');

module.exports = controlStudentModel;


