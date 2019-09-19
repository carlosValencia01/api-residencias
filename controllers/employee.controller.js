const handler = require('../utils/handler');
const status = require('http-status');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../_config');

let _employee;

const getAll = (req, res) => {
    _employee.find({})
        .exec(handler.handleMany.bind(null, 'employees', res));
};

const getById = (req, res) => {
    const { _id } = req.params;
    _employee.find({ _id: _id })
        .exec(handler.handleOne.bind(null, 'employee', res));
};

const getByControlNumber = (req, res) => {
    const { controlNumber } = req.body;
    console.log("ControlNumer" + controlNumber);
    //Hacer la petición hacia API de NIP y número de control
    _employee.find({ controlNumber: controlNumber })
        .exec(
            (err, employees) => {
                if (err) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        error: err.toString()
                    });
                }
                if (!employees.length) {
                    return res.status(status.NOT_FOUND).json({
                        error: 'employee not found'
                    });
                }

                let oneStudent = employees[0];

                const token = jwt.sign({ email: controlNumber }, config.secret);

                let formatStudent = {
                    _id: oneStudent._id,
                    name: {
                        firstName: oneStudent.fullName,
                        lastName: oneStudent.fullName,
                        fullName: oneStudent.fullName
                    },
                    email: oneStudent.controlNumber,
                    role: 2
                };

                res.json({
                    user: formatStudent,
                    token: token,
                    action: 'signin'
                });

            }
        )
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
    _employee.find(query, null, {
        skip: +start,
        limit: +limit
    }).exec(handler.handleMany.bind(null, 'employees', res));
};

const searchRfc = (req, res) => {
    const { start = 0, limit = 10 } = req.query;
    const { rfc } = req.params;

    if (!rfc) {
        return getAll(req, res);
    }
    const query = {
        rfc: rfc
    };
    _employee.find(query, null, {
        skip: +start,
        limit: +limit
    }).exec(handler.handleMany.bind(null, 'employees', res));
};

const create = (req, res, next) => {
    const employee = req.body;
    _employee.create(employee).then(created => {
        res.json({
            presentation: created
        });
    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    );
};

const createWithoutImage = (req, res) => {
    const employee = req.body;
    console.log(employee);
    _employee.create(employee).then(created => {
        res.json(created);
    }).catch(err => {
        console.log(err);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    });
};

const updateEmployee = (req, res) => {
    const { _id } = req.params;
    const employee = req.body;

    const query = { _id: _id };
    _employee.findOneAndUpdate(query, employee, { new: true })
        .exec(handler.handleOne.bind(null, 'employee', res));
};

const uploadImage = (req, res) => {
    const { _id } = req.params;
    const image = req.file;

    const query = { _id: _id };
    const updated = { filename: image.filename };

    _employee.findOneAndUpdate(query, updated, { new: true })
        .exec(handler.handleOne.bind(null, 'employee', res));
};

const updateOne = (req, res, imgId) => {
    const query = { _id: res.post_id };

    _employee.findOneAndUpdate(query).exec((err, query) => {
        if (query) {
            handler.handleOne.bind(null, 'employees', res)
        }
    });
};

const getOne = (req, res) => {
    const { _id } = req.params;
    const query = { _id: _id };

    if (_id != '1') {

        _employee.findById(query, (err, employee) => {
            if (err) {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la imagen para este registro'
                });
            }
            if (employee.filename) {
                res.set('Content-Type', 'image/jpeg');
                fs.createReadStream(path.join('images', employee.filename)).pipe(res);
            } else {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la imagen para este registro'
                });
            }

        });
    } else {
        res.status(status.NOT_FOUND).json({
            error: 'No se encontro la imagen para este registro'
        });
    }
};

const csvDegree = (req, res) => {
    const _employees = req.body;
    var findEmployee = (data) => {
        return _employee.findOne({ rfc: data.rfc }).then(
            oneEmployee => {
                if (!oneEmployee) {
                    data.isNew = true;
                    return data;
                }
                else {
                    data._id = oneEmployee._id;
                    return data;
                }
            }
        );
    };

    var secondStep = (data) => {
        if (data.isNew) {
            delete data.isNew;
            return _employee.create(data);
        }
        else {
            const query = { _id: data._id };
            return _employee.findOneAndUpdate(query, data, { new: true });
        }
    };

    var actions = _employees.map(findEmployee);
    var results = Promise.all(actions);

    results.then(data => {
        return Promise.all(data.map(secondStep));
    });

    results.then((data) => {
        res.json({ "Estatus": "Bien", "Data": data });
    }).catch((error) => {
        return res.json({ Error: error });
    });
};

const searchGrade = (req, res) => {
    const { search } = req.params;
    let query = {
        grade: { $exists: true },
        $or: [
            { rfc: { $regex: new RegExp(search, 'i') } },
            { "name.fullName": { $regex: new RegExp(search, 'i') } }
        ]
    };
    _employee.find(query, { name: 1, area: 1, position: 1, grade: 1 })
        .exec(handler.handleMany.bind(null, 'employees', res));
};

const getEmployeeByArea = (req, res) => {
    let query =
        [
            {
                $group: {
                    _id:"$deptoId",
                    values:
                    {
                        $push: { id: '$_id', name: '$name' }
                    }
                }
            }
        ];
    _employee
    .aggregate(query)
    .exec(handler.handleMany.bind(null, 'employees', res));
};

const updateEmployeGrade = (req, res) => {
    const { _id } = req.params;
    const _obj = req.body;
    const query = { _id: _id };
    _employee.findOneAndUpdate(query, _obj, { new: true })
        .exec(handler.handleOne.bind(null, 'employee', res));
};

module.exports = (Employee) => {
    _employee = Employee;
    return ({
        create,
        getOne,
        updateOne,
        getAll,
        search,
        searchRfc,
        uploadImage,
        updateEmployee,
        getByControlNumber,
        getById,
        createWithoutImage,
        csvDegree,
        searchGrade,
        updateEmployeGrade,
        getEmployeeByArea
    });
};
