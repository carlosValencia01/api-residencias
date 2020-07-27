const router = require('express').Router();

module.exports = (wagner) => {

const classroomCtrl = wagner.invoke((classroom) =>
    require('../../controllers/sgcle/classroom.controller')(classroom));

    router.post('/create', (req, res) =>
    classroomCtrl.createClassroom(req, res));

    router.get('/all', (req, res) =>
    classroomCtrl.getAllClassroom(req, res));

    router.delete('/remove/:_id', (req, res) =>
    classroomCtrl.removeClassroom(req, res));

    return router;
}