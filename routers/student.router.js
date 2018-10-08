const router = require('express').Router();

module.exports = (wagner) => {
    const studentCtrl = wagner.invoke((Student) =>
      require('../controllers/student.controller')(Student));

    router.get('/', (req, res) => 
    studentCtrl.getAll(req, res));
  
    return router;
  }