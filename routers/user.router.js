const router = require('express').Router();

module.exports = (wagner) => {
    const userCtrl = wagner.invoke((User, Student, Employee, English, Role) =>
      require('../controllers/user.controller')(User, Student, Employee, English, Role));

    router.get('/', (req, res) => 
        userCtrl.getAll(req, res));

    router.post('/register', (req, res) =>
        userCtrl.register(req, res));

    router.post('/login', (req, res) =>
        userCtrl.login(req, res));
  
    return router;
  };
