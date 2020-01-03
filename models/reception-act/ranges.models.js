const mongoose = require('mongoose');

let rangeSchema = new mongoose.Schema({
    start: { type: Date, require: true },
    end: { type: Date, require: true },
    careers: [{ type: String }],
    quantity: { type: Number }
});

const rangeModel = mongoose.model('Range', rangeSchema, 'ranges');

module.exports = rangeModel;