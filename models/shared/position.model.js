const mongoose = require('mongoose');

let positionSchema = mongoose.Schema({
    name: {type: String},
    ascription: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
    documents: [{type: mongoose.Schema.Types.ObjectId, ref: 'Document'}],
    canSign: {type: Boolean, default: false},
    isUnique: {type: Boolean, default: false},
    gender: {
        male: {type: String, uppercase: true, trim: true},
        female: {type: String, uppercase: true, trim: true}
    }
});

const positionModel = mongoose.model('Position', positionSchema, 'positions');

module.exports = positionModel;
