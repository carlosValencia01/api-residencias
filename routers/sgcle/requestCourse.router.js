const router = require('express').Router();

module.exports = (wagner) => {

    const requestCourseCtrl = wagner.invoke((RequestCourse,EnglishStudent) =>
        require('../../controllers/sgcle/requestCourse.controller')(RequestCourse,EnglishStudent));

    router.get('/all', (req, res) =>
    requestCourseCtrl.getAllRequestCourse(req, res));

    router.get('/all/requested/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestCourseByCourseAndRequested(req, res));

    router.get('/all/studying/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestCourseByCourseAndStudying(req, res));

    router.post('/create', (req, res) =>
    requestCourseCtrl.createRequestCourse(req, res));

    router.put('/update/:_id', (req, res) =>
    requestCourseCtrl.updateRequestCourseById(req, res));

    router.put('/update/student/:_id', (req, res) =>
    requestCourseCtrl.updateRequestCourseByStudentId(req, res));

    router.post('/active/request', (req, res) =>
    requestCourseCtrl.activeRequestCourse(req, res));

    return router;
}