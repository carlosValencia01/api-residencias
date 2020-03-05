const mongoose = require('mongoose');

const imssSchema = mongoose.Schema({
    controlNumber: { type: String, unique: true, trim: true },
    registerDate: { type: Date }
});

const imssModel = mongoose.model('IMSS', imssSchema, 'imss');

module.exports = imssModel;
