const mongoose = require('mongoose');

let inscriptionSchema = new mongoose.Schema({
    email: {type: String, unique: false}
});

const inscriptionModel = mongoose.model('Inscription', inscriptionSchema, 'inscriptions');

module.exports = inscriptionModel;
