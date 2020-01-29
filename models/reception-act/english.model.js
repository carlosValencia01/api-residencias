const mongoose = require('mongoose');

const englishSchema = mongoose.Schema({
    controlNumber: { type: String, unique: true, trim: true },
    releaseDate: { type: Date }
});

const englishModel = mongoose.model('English', englishSchema, 'english');

module.exports = englishModel;
