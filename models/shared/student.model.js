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
        { filename: { type: String }, releaseDate: { type: Date, default: new Date() }, type: { type: String }, status:{ type: String }, observations:{ type: String }, fileIdInDrive:{type:String} }
    ],
    idRole: { type: mongoose.Schema.Types.ObjectId, ref:'Role' },
    firstName: {type:String},
    lastNameFather: {type:String},
    lastNameMother: {type:String},    
    placeBirth: {type:String},
    dateBirth: {type:String},
    statusCivil: {type:String},
    email: {type:String},
    curp: {type:String},
    nss: {type:Number},
    sex: {type:String},
    street: {type:String},
    colony: {type:String},
    city: {type:String},
    state: {type:String},
    postalCode: {type:Number},
    phone: {type:Number},
    etnia: {type:String},
    otherEtnia: {type:String, required:false},
    disability: {type:String},
    whichDisability: {type:String, required:false},
    school: {type:String},
    otherSchool: {type:String, required:false},
    nameSchool: {type:String},
    average: {type:Number},       
    statusInscripcion: {type: String, required:false},
    academicRecord:{type:Boolean},
    semester: {type: String}
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
