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
    filename: { type: String },
    deptoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isBoss: { type: Boolean, default: false },
    grade: [{
        _id: false,
        title: { type: String, uppercase: true, trim: true },
        cedula: { type: String, uppercase: true, trim: true },
        abbreviation: { type: String, uppercase: true, trim: true },
        level: { type: String, enum: ['DOCTORADO', 'MAESTRÍA', 'LICENCIATURA'], uppercase: true, trim: true },
        default: { type: Boolean, default: false }
    }],
});
// , {
//         toObject: {
//             virtuals: true
//         },
//         toJSON: {
//             virtuals: true
//         }
//     });
// employeeSchema.set('toObject', { virtuals: true });
// employeeSchema.set('toJSON', { virtuals: true });

// employeeSchema.virtual('gradeMax').get(() => {
//     if (typeof (this.grade) === 'undefined')
//         return '';
//     let isGrade = this.grade.find(x => x.level === 'DOCTORADO');
//     if (typeof (isGrade) !== 'undefined')
//         return isGrade.abbreviation;
//     isGrade = this.grade.find(x => x.level === 'MAESTRÍA');
//     if (typeof (isGrade) !== 'undefined')
//         return isGrade.abbreviation;
//     isGrade = this.grade.find(x => x.level === 'LICENCIATURA');
//     if (typeof (isGrade) !== 'undefined')
//         return isGrade.abbreviation;
//     return "";
// })
const employeeModel = mongoose.model('Employee', employeeSchema, 'employees');

module.exports = employeeModel;