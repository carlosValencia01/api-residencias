const router = require('express').Router();

module.exports = (wagner) => {
    const scheduleCtrl = wagner.invoke((Student, Schedule) =>
        require('../../controllers/schedule/schedule.controller')(Student, Schedule));

    router.get('/getStudentSchedule/:_idStudent', (req, res) => {
        scheduleCtrl.findStudentSchedule(req, res);
    });

    return router;
};