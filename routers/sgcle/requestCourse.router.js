const router = require('express').Router();

module.exports = (wagner) => {

    const requestCourseCtrl = wagner.invoke((RequestCourse) =>
        require('../../controllers/sgcle/requestCourse.controller')(RequestCourse));

    router.get('/all', (req, res) =>
    requestCourseCtrl.getAllRequestCourse(req, res));

    router.get('/all/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestCourseByCourseAndRequested(req, res));

    router.post('/create', (req, res) =>
    requestCourseCtrl.createRequestCourse(req, res));

    router.put('/update/:_id', (req, res) =>
    requestCourseCtrl.updateRequestCourse(req, res));

    return router;
}