const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    filename: { type: String },
    originalName: { type: String },
    controlNumber: { type: String, unique: true },
    fullName: { type: String },
    career: { type: String },
    nss: { type: String },
    nip: { type: String },    
    documents:[
        { filename: { type: String }, releaseDate: { type: Date }, type: { type: String }, status:{ type: String }, observations:{ type: String } }
    ],
    idRole: { type: mongoose.Schema.Types.ObjectId, ref:'Role' },
    firstName: {type:String, required:true},
    fatherLastName: {type:String, required:true},
    motherLastName: {type:String, required:true},    
    birthPlace: {type:String, required:true},
    dateBirth: {type:String, required:true},
    civilStatus: {type:String, required:true},
    email: {type:String, required:true},
    curp: {type:String, required:true},
    nss: {type:String, required:true},
    sex: {type:String},
    street: {type:String, required:true},
    suburb: {type:String, required:true},
    city: {type:String, required:true},
    state: {type:String, required:true},
    cp: {type:Number, required:true},
    phone: {type:String, required:true},
    etnia: {type:String, required:true},
    typeEtnia: {type:String, required:false},
    disability: {type:String, required:true},
    typeDisability: {type:String, required:false},
    originSchool: {type:String, required:true},
    otherSchool: {type:String, required:false},
    nameOriginSchool: {type:String, required:true},
    averageOriginSchool: {type:Number, required:true},       
    statusInscripcion: {type: String},
    academicRecord:{type:Boolean},
    acceptedTerms:{type:Boolean},
    dateAcceptedTerms:{type:Date},
    stepWizard: {type:Number},
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
