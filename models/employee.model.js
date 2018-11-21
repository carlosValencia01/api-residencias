const mongoose = require('mongoose');

let employeeSchema = new mongoose.Schema({
    rfc: { type: String, unique: true, uppercase: true, trim: true, minlength: 10, maxlength:13 },
    name: {
        firstName: { type: String, required: true, uppercase: true, trim: true },
        lastName: { type: String, required: true, uppercase: true, trim: true },
        fullName: { type: String, required: true, uppercase: true, trim: true }
    },
    area: { type: String, required: true, uppercase: true, trim: true },
    position: { type: String, required: true, uppercase: true, trim: true },
    filename: { type: String }
});

const employeeModel = mongoose.model('Employe', employeeSchema, 'employees');

module.exports = employeeModel;