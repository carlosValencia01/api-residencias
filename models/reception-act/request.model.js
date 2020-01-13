const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    email: { type: String },
    applicationDate: { type: Date, required: true },
    projectName: { type: String, },
    product: { type: String },
    proposedDate: { type: Date },
    proposedHour: { type: Number },
    duration: { type: Number, default: 60 },
    place: { type: String },
    actDate: { type: Date },
    telephone: { type: String },
    honorificMention: { type: Boolean, default: false },
    phase: { type: String, enum: ['Capturado', 'Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado', 'Validado', 'Asignado', 'Realizado', 'Generado', 'Titulado'], required: true },
    status: { type: String, enum: ['Process', 'Accept', 'Error', 'Reject', 'None', 'Wait', 'Cancelled', 'Printed', 'Finalized'] },
    lastModified: { type: Date, required: true },
    observation: { type: String, default: '' },
    doer: { type: String },
    adviser: { type: String },
    noIntegrants: { type: Number },
    jury: [
        { name: { type: String }, title: { type: String }, cedula: { type: String } }
    ],
    integrants: [
        { name: { type: String }, controlNumber: { type: Number }, career: { type: String } }
    ],
    department: { name: { type: String }, boss: { type: String } },
    history: [
        {
            phase: { type: String, enum: ['Capturado', 'Enviado', 'Verificado', 'Registrado', 'Liberado', 'Entregado', 'Validado', 'Asignado', 'Realizado', 'Generado', 'Titulado'] },
            status: { type: String, enum: ['Process', 'Accept', 'Error', 'Reject', 'None', 'Cancelled', 'Finalized'] },
            observation: { type: String },
            achievementDate: { type: Date },
            doer: { type: String, required: true }
        }
    ],
    documents: [
        {
            type: { type: String, required: true },
            dateRegister: { type: Date, required: true },
            nameFile: { type: String, default: '' },
            observation: { type: String, default: '' },
            status: { type: String, enum: ['Process', 'Accept', 'Reject', 'Omit'] },
            driveId: { type: String }
        }
    ]
});

const requestModel = mongoose.model('Request', requestSchema, 'requests');
module.exports = requestModel;    
