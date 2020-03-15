const mongoose = require('mongoose');

let departmentSchema = new mongoose.Schema({
    name: { type: String },
    shortName: { type: String },
    careers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Career'}],
    nameMale: { type: String },
    nameFemale: { type: String }
});

const deparmentModel = mongoose.model('Department', departmentSchema, 'departments');

module.exports = deparmentModel;
