const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    filename: { type: String },
    originalName: { type: String },
    controlNumber: { type: String, unique: true },
    fullName: { type: String },
    career: { type:String },
    careerId : {type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
    nss: { type: String },
    nip: { type: String },    
    folderId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    idPeriodInscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' },
    documents:[
        { 
            filename: { type: String }, 
            releaseDate: { type: Date, default: new Date() }, 
            type: { type: String }, 
            // status:{ type: String },             
            fileIdInDrive:{ type: String },
            // observation:{ type: String },
            status:[
                {
                    name: { type: String }, // Inscripciones:['EN PROCESO', 'RECHAZADO', 'VALIDADO', 'ACEPTADO']
                    active: { type: Boolean },                    
                    message:{ type: String },  // Se envio, Se actualizo, se rechazo, se valido, se acepto                  
                    date:{ type: Date, default: new Date() },
                    observation:{ type: String } // si fue rechazado
                }
            ]
        }
    ],
    idRole: { type: mongoose.Schema.Types.ObjectId, ref:'Role' },
    firstName: {type:String},
    fatherLastName: {type:String},
    motherLastName: {type:String},    
    birthPlace: {type:String},
    dateBirth: {type:String},
    civilStatus: {type:String},
    email: {type:String},
    curp: {type:String},
    nss: {type:String},
    sex: {type:String},
    street: {type:String},
    suburb: {type:String},
    city: {type:String},
    state: {type:String},
    cp: {type:Number},
    phone: {type:String},
    etnia: {type:String},
    typeEtnia: {type:String, required:false},
    disability: {type:String},
    typeDisability: {type:String, required:false},
    originSchool: {type:String},
    otherSchool: {type:String, required:false},
    nameOriginSchool: {type:String},
    averageOriginSchool: {type:Number},       
    statusInscripcion: {type: String},
    academicRecord:{type:Boolean},
    acceptedTerms:{type:Boolean},
    dateAcceptedTerms:{type:Date},
    stepWizard: {type:Number},
    semestre: {type: String},
    inscriptionStatus: {type: String},
    observationsAnalysis: {type: String}
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
