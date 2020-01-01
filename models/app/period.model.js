const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({    
    periodName: String,
    year: String,
    active: Boolean,   
    initDate :{ type: Date, default: new Date},
    endDate :{ type: Date},    
    insPerInitDate:{type: Date},
    insPerEndDate:{type: Date},
    arecPerInitDate:{type: Date}, // arec = acto recepcional
    arecPerEndDate:{type: Date},
    arecInitShed:{type: Number}, // inicio horario agenda acto recepcional
    arecEndShed:{type: Number}, // fin horario agenda acto recepcional
    certificateDeliveryDate: {type: Date}, //fecha de entrega del certificado,
    code:{type:String} // clave del periodo año+(1 || 3) 1===enero-junio, 3===agosto-diciembre, ej. 20201
});

const periodModel = mongoose.model('Period', periodSchema, 'periods');

module.exports = periodModel;
