const router = require('express').Router();

module.exports = (wagner) => {
    const userCtrl = wagner.invoke((User, Student, Employee) =>
      require('../controllers/user.controller')(User, Student, Employee));

    router.get('/', (req, res) => 
        userCtrl.getAll(req, res));

    router.get('/employee/:email', (req, res) =>
        userCtrl.getDataEmployee(req, res));

    router.post('/register', (req, res) =>
        userCtrl.register(req, res));

    router.post('/login', (req, res) =>
        userCtrl.login(req, res));

    router.put('/update/:_id', (req, res) =>
        userCtrl.updateUserData(req, res));
  
    return router;
  };
