const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    controlNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    career: { type: String, required: true },
    nss: { type: String },
    photo: { type: String },
    nip: { type: String }
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;