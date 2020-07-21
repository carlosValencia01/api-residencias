const router = require('express').Router();

module.exports = (wagner) => {

    const requestCourseCtrl = wagner.invoke((RequestCourse) =>
        require('../../controllers/sgcle/requestCourse.controller')(RequestCourse));

    router.get('/all', (req, res) =>
    requestCourseCtrl.getAllRequestCourse(req, res));

    router.post('/update', (req, res) =>
    requestCourseCtrl.updateRequestCourse(req, res));

    return router;
}