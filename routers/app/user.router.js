const router = require('express').Router();

module.exports = (wagner) => {

    const userCtrl = wagner.invoke((User, Student, Employee, Role, Career, English, IMSS) =>
        require('../../controllers/app/user.controller')(User, Student, Employee, Role, Career, English, IMSS));

    router.get('/', (req, res) =>
        userCtrl.getAll(req, res));
    router.get('/secretaries', (req, res) =>
        userCtrl.getSecretaries(req, res));

    router.get('/employee/:email', (req, res) =>
        userCtrl.getDataEmployee(req, res));

    router.get('/student/status/:_id', (req, res) =>
        userCtrl.getStatusDegree(req, res));

    router.post('/register', (req, res) =>
        userCtrl.register(req, res));

    router.post('/login', (req, res) =>
        userCtrl.login(req, res));

    router.post('/student/login', (req, res) =>
        userCtrl.studentLogin(req, res));
    router.post('/graduation/login', (req, res) =>
        userCtrl.loginMiGraduacion(req, res));

    router.post('/titled/register', (req, res) =>
        userCtrl.titledRegister(req, res));

    router.put('/update/:_id', (req, res) =>
        userCtrl.updateUserData(req, res));
    router.put('/update/fullName/:nc', (req, res) =>
        userCtrl.updateFullName(req, res));
    router.put('/:action/career/user/:_id', (req, res) =>
        userCtrl.updateCareersUser(req, res));

    return router;
};
