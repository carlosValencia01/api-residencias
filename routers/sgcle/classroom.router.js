const router = require('express').Router();

module.exports = (wagner) => {

const classroomCtrl = wagner.invoke((Classroom) =>
    require('../../controllers/sgcle/classroom.controller')(Classroom));

    router.post('/create', (req, res) =>
    classroomCtrl.createClassroom(req, res));

    router.get('/all', (req, res) =>
    classroomCtrl.getAllClassroom(req, res));

    router.delete('/remove/:_id', (req, res) =>
    classroomCtrl.removeClassroom(req, res));
    
    router.put('/update/:_id', (req, res) =>
    classroomCtrl.updateClassroom(req, res));

    return router;
}