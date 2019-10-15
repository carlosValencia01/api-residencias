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
    lastNameFather: {type:String, required:true},
    lastNameMother: {type:String, required:true},    
    placeBirth: {type:String, required:true},
    dateBirth: {type:String, required:true},
    statusCivil: {type:String, required:true},
    email: {type:String, required:true},
    curp: {type:String, required:true},
    nss: {type:Number, required:true},
    sex: {type:String, required:true},
    street: {type:String, required:true},
    colony: {type:String, required:true},
    city: {type:String, required:true},
    state: {type:String, required:true},
    postalCode: {type:Number, required:true},
    phone: {type:Number, required:true},
    etnia: {type:String, required:true},
    otherEtnia: {type:String, required:false},
    disability: {type:String, required:true},
    whichDisability: {type:String, required:false},
    school: {type:String, required:true},
    otherSchool: {type:String, required:false},
    nameSchool: {type:String, required:true},
    average: {type:Number, required:true},       
    statusInscripcion: {type: String, required:false},
    academicRecord:{type:Boolean}
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
