const mongoose = require('mongoose');

const courseScheduleSchema = new mongoose.Schema({

    idCourse: {type: mongoose.Schema.Types.ObjectId, ref: 'EnglishCourse'},
    days: [
        {
            desc: {type: String},               //Descripción de los días ('Sabados', 'Lunes a Viernes')
            enable: {type: Boolean},            //Habilitar y deshabilitar dias por curso
            hours: [
                {
                    desc: {type: String},       //Descripción de las horas (07:00 a.m. - 10:00 a.m.)
                    active: {type: Boolean}     //Activar o desactivar la hora
                }
            ]
        }
    ]

});

const courseScheduleModel = mongoose.model('CourseSchedule', courseScheduleSchema, 'courseSchedules');

module.exports = courseScheduleModel;