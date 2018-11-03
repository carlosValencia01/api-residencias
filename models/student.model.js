const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    filename: { type: String},
    originalName: { type: String},
    controlNumber: { type: String, unique: true},
    fullName: { type: String},
    career: { type: String},
    nss: { type: String },
    nip: { type: String }
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;