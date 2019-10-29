const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    id: { type:Number, unique: true },
    name: String,
    year: String,
    active: Boolean
});

const periodModel = mongoose.model('Period', periodSchema, 'periods');

module.exports = periodModel;
