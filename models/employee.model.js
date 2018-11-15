const mongoose = require('mongoose');

let employeeSchema = new mongoose.Schema({
    rfc: { type: String },
    name: {
        firstName: { type: String },
        lastName: { type: String },
        fullName: { type: String }
    },
    area: { type: String },
    position: { type: String },
    filename: { type: String }
});

const employeeModel = mongoose.model('Employe', employeeSchema, 'employees');

module.exports = employeeModel;