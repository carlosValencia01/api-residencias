const mongoose = require('mongoose');

const englishStateSchema = new mongoose.Schema({
    studentId: {type: String},
    requestCourse: [
        {
            name: {type: String},
            day: {type: String},
            schedule: {type: String},
            actualPhone: {type: String},
            startDate: {type: Date},
            endDate: {type: Date},
            status: {type: String, enum: ['EN ESPERA', 'ACEPTADO', 'RECHAZADO']}
        }
    ]
});

const englishStateModel = mongoose.model('EnglishState', englishStateSchema, 'englishStates');

module.exports = englishStateModel;
