const mongoose = require('mongoose');

let requestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    email: { type: String, required: true },
    applicationDate: { type: Date, required: true },
    projectName: { type: String, required: true },
    product: { type: String, required: true },
    proposedDate: { type: Date, required: true },
    actDate: { type: Date },
    telephone: { type: String, required: true },
    honorificMention: { type: Boolean, required: true, default: false },
    phase: { type: String, enum: ['Capturado', 'Enviado','Verificado', 'Registrado', 'Liberado', 'Entregado','Validado', 'Asignado', 'Realizado', 'Generado'], required: true },
    status: { type: String, enum: ['Process', 'Accept', 'Error', 'Reject', 'None'] },
    lastModified: { type: Date, required: true },
    observation: { type: String, default: '' },
    doer: { type: String },
    adviser: { type: String },
    noIntegrants: { type: Number },
    integrants: [
        { name: { type: String }, controlNumber: { type: Number }, career: { type: String } }
    ],
    department: { name: { type: String }, boss: { type: String } },
    history: [
        {
            phase: { type: String, enum: ['Capturado', 'Enviado','Verificado', 'Registrado', 'Liberado', 'Entregado','Validado', 'Asignado', 'Realizado', 'Generado'] },
            status: { type: String, enum: ['Process', 'Accept', 'Error', 'Reject', 'None'] },
            observation: { type: String },
            achievementDate: { type: Date },
            doer: { type: String, required: true }
        }
    ],
    documents: [
        {
            type: { type: String, required: true },
            dateRegister: { type: Date, required: true },
            nameFile: { type: String, required: true },
            status: { type: String, enum: ['process', 'wait', 'finish', 'error'] }
        }
    ]
});

const requestModel = mongoose.model('Request', requestSchema, 'requests');
module.exports = requestModel;    
