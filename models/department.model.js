const mongoose = require('mongoose');

let departmentSchema = new mongoose.Schema({
    name: { type: String },
    careers: [{ type: String }]
});

const deparmentModel = mongoose.model('Department', departmentSchema, 'departments');

module.exports = deparmentModel;
