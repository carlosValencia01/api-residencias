const mongoose = require('mongoose');

let employeeSchema = new mongoose.Schema({
    rfc: { type: String, unique: true, uppercase: true, trim: true, minlength: 10, maxlength: 13 },
    name: {
        firstName: { type: String, required: true, uppercase: true, trim: true },
        lastName: { type: String, required: true, uppercase: true, trim: true },
        fullName: { type: String, required: true, uppercase: true, trim: true }
    },
    area: { type: String, required: true, uppercase: true, trim: true },
    position: { type: String, required: true, uppercase: true, trim: true },
    deptoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isBoss: { type: Boolean, default: false },
    filename: { type: String },
    grade: [{
        _id: false,
        title: { type: String, uppercase: true, trim: true },
        cedula: { type: String, uppercase: true, trim: true },
        abbreviation: { type: String, uppercase: true, trim: true },
        level: { type: String, enum: ['DOCTORADO', 'MAESTRIA', 'LICENCIATURA'], uppercase: true, trim: true },
        default: { type: Boolean, default: false }
    }],
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }]
});
const employeeModel = mongoose.model('Employee', employeeSchema, 'employees');

module.exports = employeeModel;
