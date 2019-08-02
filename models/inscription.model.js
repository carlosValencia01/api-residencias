const mongoose = require('mongoose');

let inscriptionSchema = new mongoose.Schema({
    email: {type: String, unique: true}
});

const inscriptionModel = mongoose.model('Inscription', inscriptionSchema, 'inscriptions');

module.exports = inscriptionModel;
