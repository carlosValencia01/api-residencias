const mongoose = require('mongoose');

let careerSchema = new mongoose.Schema({
    fullName: { type: String },
    shortName: { type: String },
    acronym: { type: String }
});

const careerModel = mongoose.model('Career', careerSchema, 'careers');

module.exports = careerModel;