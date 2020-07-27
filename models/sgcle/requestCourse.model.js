const mongoose = require('mongoose');

const requestCourseSchema = new mongoose.Schema({
    name: {type: String},
    period: {type: String},
    days: [
        {
            desc: {type: String},
            hours: [
                {
                    desc: {type: String},
                    students: [{type: mongoose.Schema.Types.ObjectId, ref: 'EnglishStudent' }]
                }
            ]
        }
    ],
});

const requestCourseModel = mongoose.model('RequestCourse', requestCourseSchema, 'requestCourses');

module.exports = requestCourseModel;
