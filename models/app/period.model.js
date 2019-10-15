const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({    
    name: String,
    year: String,
    active: Boolean,   
    initDate :{ type: Date, default: new Date},
    endDate :{ type: Date, required: false},    
    inscriptionStudentsNumber : {type: Number, required: false}
});

const periodModel = mongoose.model('Period', periodSchema, 'periods');

module.exports = periodModel;
