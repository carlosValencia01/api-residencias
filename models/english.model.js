const mongoose = require('mongoose');

const englishSchema = new mongoose.Schema({
    controlNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, uppercase: true, trim: true },
});

const englishModel = mongoose.model('English', englishSchema, 'english');

module.exports = englishModel;
