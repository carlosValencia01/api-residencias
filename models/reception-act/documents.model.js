const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    filename: { type: String },
    dueDate: { type: date },
    type: { type: String }    
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;