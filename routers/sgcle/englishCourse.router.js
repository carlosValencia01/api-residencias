const router = require('express').Router();

module.exports = (wagner) => {

const englishCourseCtrl = wagner.invoke((EnglishCourse, EnBossMessage) =>
    require('../../controllers/sgcle/englishCourse.controller')(EnglishCourse, EnBossMessage));

    router.post('/create', (req, res) =>
    englishCourseCtrl.createEnglishCourse(req, res));

    router.get('/all', (req, res) =>
    englishCourseCtrl.getAllEnglishCourse(req, res));

    router.get('/all/active', (req, res) =>
    englishCourseCtrl.getAllEnglishCourseActive(req, res));

    router.get('/boss/message', (req, res) =>
    englishCourseCtrl.getEnBossMessage(req, res));

    router.post('/boss/message', (req, res) =>
    englishCourseCtrl.createEnBossMessage(req, res));

    router.put('/boss/message/:_id', (req, res) =>
    englishCourseCtrl.updateEnBossMessage(req, res));

    return router;
}