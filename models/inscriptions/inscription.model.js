const mongoose = require('mongoose');

let inscriptionSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true },
    period: String
});

const inscriptionModel = mongoose.model('Inscription', inscriptionSchema, 'inscriptions');

module.exports = inscriptionModel;
