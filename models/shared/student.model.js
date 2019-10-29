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
        { filename: { type: String }, releaseDate: { type: Date }, type: { type: String }, status:{ type: String } }
    ],
    idRole: { type: mongoose.Schema.Types.ObjectId, ref:'Role' }
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;
