const router = require('express').Router();

module.exports = (wagner) => {

    const requestCourseCtrl = wagner.invoke((RequestCourse,EnglishStudent,Period) =>
        require('../../controllers/sgcle/requestCourse.controller')(RequestCourse,EnglishStudent,Period));

    router.get('/all', (req, res) =>
    requestCourseCtrl.getAllRequestCourse(req, res));

    router.get('/student/:_id', (req, res) =>
    requestCourseCtrl.getRequestCourse(req, res));

    router.get('/all/requested/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestCourseByCourseAndRequested(req, res));

    router.get('/all/studying/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestCourseByCourseAndStudying(req, res));
    
    router.get('/by/englishstudent/:_id', (req, res) =>
    requestCourseCtrl.getActiveRequestCourseByEnglishStudentId(req, res));

    // GET: Return requests in status requested
    // @params {id} - Group id
    router.get(
        '/:id/requests',
        requestCourseCtrl.getRequestedGroupRequests);

    router.post('/create', (req, res) =>
    requestCourseCtrl.createRequestCourse(req, res));

    router.put('/update/:_id', (req, res) =>
    requestCourseCtrl.updateRequestCourseById(req, res));

    router.put('/update/student/:_id', (req, res) =>
    requestCourseCtrl.updateRequestCourseByStudentId(req, res));

    router.put('/paidstatus', (req, res) =>
    requestCourseCtrl.updateStatusToPaid(req, res));

    router.post('/active/request', (req, res) =>
    requestCourseCtrl.activeRequestCourse(req, res));

    router.get('/all/active/:_id', (req, res) =>
    requestCourseCtrl.getAllRequestActiveCourse(req, res));

    router.post('/decline/request', (req, res) =>
    requestCourseCtrl.declineRequestActiveCourse(req, res));

    router.post('/add/request', (req, res) =>
    requestCourseCtrl.AddRequestActiveCourse(req, res));

    return router;
}