const mongoose = require('mongoose');

let activeStudentsSchema = new mongoose.Schema({
    controlNumber: {type: String}
});

const activeStudentsModel = mongoose.model('ActiveStudents', activeStudentsSchema, 'activestudents');

module.exports = activeStudentsModel;