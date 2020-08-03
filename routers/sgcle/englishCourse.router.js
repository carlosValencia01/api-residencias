const router = require('express').Router();

module.exports = (wagner) => {

const englishCourseCtrl = wagner.invoke((EnglishCourse) =>
    require('../../controllers/sgcle/englishCourse.controller')(EnglishCourse));

    router.post('/create', (req, res) =>
    englishCourseCtrl.createEnglishCourse(req, res));

    router.get('/all', (req, res) =>
    englishCourseCtrl.getAllEnglishCourse(req, res));

    router.get('/all/active', (req, res) =>
    englishCourseCtrl.getAllEnglishCourseActive(req, res));

    return router;
}