const mongoose = require('mongoose');

let welcomeDataSchema = new mongoose.Schema({
    students: [{
        career: {type: String},
        controlNumber: {type: String},
        curp: {type: String},
        institutionalEmail: {type: String},
        name: {type: String},
        nip: {type: String},
        personalEmail: {type: String},
        revalidatedSemesters: {type: String}
    }]
});

const welcomeDataModel = mongoose.model('WelcomeData', welcomeDataSchema, 'welcomeData');

module.exports = welcomeDataModel;
