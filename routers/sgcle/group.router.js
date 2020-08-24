const router = require('express').Router();

module.exports = (wagner) => {

const groupCtrl = wagner.invoke((Group,EnglishStudent,RequestCourse) =>
    require('../../controllers/sgcle/group.controller')(Group,EnglishStudent,RequestCourse));

    router.post('/create', (req, res) =>
    groupCtrl.createGroup(req, res));

    // @params { id } Group id
    router.post('/:id/assign-teacher', (req, res) =>
        groupCtrl.assignGroupEnglishTeacher(req, res));

    router.get('/all', (req, res) =>
    groupCtrl.getAllGroup(req, res));

    router.get('/all/opened', (req, res) =>
    groupCtrl.getAllGroupOpened(req, res));
    
    router.get('/all/opened/by-course-and-level', (req, res) =>
    groupCtrl.getAllGroupOpenedByCourseAndLevel(req, res));


    router.get('/students/:_groupId', (req, res) => {
        groupCtrl.getPaidStudentsCourse(req, res);
    });


    return router;
}