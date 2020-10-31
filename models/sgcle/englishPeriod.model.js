const mongoose = require('mongoose');

const englishPeriodSchema = new mongoose.Schema({
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'Period' },  //Referencia al periodo general
    active: Boolean,
    reqPerInitDate:{type: Date},    //Fecha de inicio del periodo de solicitudes (Enviar solicitud)
    reqPerEndDate:{type: Date},     //Fecha final del periodo de solicitudes (Enviar solicitud)
    secReqPerInitDate:{type: Date}, //Fecha de inicio del segundo periodo de solicitudes (Enviar solicitud)
    secReqPerEndDate:{type: Date},  //Fecha final del segundo periodo de solicitudes (Enviar solicitud)
    evaPerInitDate:{type: Date},    //Fecha de inicio del periodo de evaluación (Calificar)
    evaPerEndDate:{type: Date},     //Fecha final del periodo de evaluación (Calificar)
});

const englishPeriodModel = mongoose.model('EnglishPeriod', englishPeriodSchema, 'englishPeriods');

module.exports = englishPeriodModel;
