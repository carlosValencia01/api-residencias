const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({    
    periodName: String,
    year: String,
    active: Boolean,   
    initDate :{ type: Date, default: new Date},
    endDate :{ type: Date},    
    insPerInitDate:{type: Date},
    insPerEndDate:{type: Date},
    arecPerInitDate:{type: Date},
    arecPerEndDate:{type: Date},
    arecInitShed:{type: Number},
    arecEndShed:{type: Number},
});

const periodModel = mongoose.model('Period', periodSchema, 'periods');

module.exports = periodModel;
