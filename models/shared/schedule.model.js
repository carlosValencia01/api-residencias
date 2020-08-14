const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    studentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    schedules : [{ 
        dateFirm: {type: Date},
        period: {type: String},
        average: {type: String},
        specialty: {type: String},
        driveId : {type: String, default : ''},
        schedule:[{   
            subjectCode: {type: String},
            subjectName: {type: String},
            subjectTeacher: {type: String},
            group: {type: String},
            credits: {type: Number},
            global: {type: Boolean},
            monday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            },
            tuesday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            },
            wednesday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            },
            thursday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            },
            friday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            },
            saturday: {
                startDate: {type: String},
                endDate: {type: String},
                classroom: {type: String}
            }
        }] 
    }]
});

const scheduleModel = mongoose.model('Schedule', scheduleSchema, 'schedule');

module.exports = scheduleModel;
