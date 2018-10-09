const handler = require('../utils/handler');
const status = require('http-status');
const fs = require('fs')
const path = require('path');
const del = require('del');

let _student;

const getAll = (req, res) => {
    _student.find({})
        .exec(handler.handleMany.bind(null, 'students', res));
};

const search = (req, res) => {
    const { start = 0, limit = 10 } = req.query;
    const { search } = req.params;

    if (!search) {
        return getAll(req, res);
    }

    const query = {
        $text: {
            $search: search,
            $language: 'es'
        }
    };
    _student.find(query, null, {
        skip: +start,
        limit: +limit
    }).exec(handler.handleMany.bind(null, 'students', res));
};


const create = (req, res, next) => {

    let newStudent = new _student();
    newStudent.filename = req.file.filename;
    newStudent.originalName = req.file.originalname;
    newStudent.fullName = req.body.fullName;
    newStudent.controlNumber = req.body.controlNumber;
    newStudent.career = req.body.career;
    newStudent.nss = req.body.nss;
    newStudent.nip = req.body.nip;
    newStudent.save(err => {
        if (err) {
            res.sendStatus(400);
            console.log("el error", err)
        }
        res.status(201).send({ newStudent });
    })
}

const updateOne = (req, res, imgId) => {
    const query = { _id: res.post_id }

    _student.findOneAndUpdate(query).exec((err, query) => {
        if (query) {
            handler.handleOne.bind(null, 'students', res)
        }
    })
}


const getOne = (req, res, imgId) => {
    _student.findById(imgId, (err, image) => {
        if (err) {
            res.sendStatus(400);
        }
        res.set('Content-Type', 'image/jpeg');
        fs.createReadStream(path.join('images', image.filename)).pipe(res);
    })
}
/*
const create = (req,res) => {
    const student = req.body;
    _student.findOneAndUpdate(student, student, {
        strict: false,
        upsert: true,
        new: true,
        runValidators: true
    }).exec(handler.handleOne.bind(null, 'students', res));
};
*/

module.exports = (Student) => {
    _student = Student;
    return ({
        create,
        getOne,
        updateOne,
        getAll,
        search
    });
};
