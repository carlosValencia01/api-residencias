const handler = require('../../utils/handler');
const status = require('http-status');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../../_config');

let _employee;
let _position;

const getAll = (req, res) => {
    _employee.find({})
        .exec(handler.handleMany.bind(null, 'employees', res));
};

const getById = (req, res) => {
    const { _id } = req.params;
    _employee.findOne({ _id: _id })
        .populate({
            path: 'positions.position', model: 'Position', select: 'name ascription canSign',
            populate: { path: 'ascription', model: 'Department', select: 'name shortName' }})
        .exec(handler.handleOne.bind(null, 'employee', res));
};

const getByControlNumber = (req, res) => {
    const { controlNumber } = req.body;
    console.log('ControlNumer' + controlNumber);
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
    _employee
        .findOne(query)
        .populate({
            path: 'positions.position',
            model: 'Position',
            select: 'name ascription -_id',
            populate: {path: 'ascription', model: 'Department', select: 'name shortName -_id'}
        })
        .exec((err, employee) => {
            if (!err && employee) {
                const positions = employee.positions.filter(pos => pos.status === 'ACTIVE');
                employee.positions = positions.slice();
                res
                    .status(status.OK)
                    .json(employee);
            } else {
                res
                    .status(err ? status.INTERNAL_SERVER_ERROR : status.NOT_FOUND)
                    .json({
                        error: err ? err.toString() : 'Empleado no encontrado'
                    });
            }
        });
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
        res.json({ 'Estatus': 'Bien', 'Data': data });
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
            { 'name.fullName': { $regex: new RegExp(search, 'i') } }
        ]
    };
    _employee.find(query, { name: 1, area: 1, position: 1, grade: 1 })
        .exec(handler.handleMany.bind(null, 'employees', res));
};

// Deprecated
const getEmployeeByArea = (req, res) => {
    let query =
        [
            {
                $group: {
                    _id:'$deptoId',
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

const updateEmployeePositions = async (req, res) => {
    const {_id} = req.params;
    const _positions = req.body;

    for (let index in _positions) {
        const item = _positions[index];
        const position = item.position;
        if (position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO' || position.name.toUpperCase() === 'DIRECTOR') {
            if (await _isAssignedDepartmentBoss(position._id) && item.status === 'ACTIVE') {
                _positions.splice(index, 1);
            }
        }
    }

    _employee.updateOne({_id: _id}, {positions: _positions}, (err, updated) => {
        if (!err && updated) {
            res.status(status.OK)
                .json({status: updated.n ? status.OK : status.NOT_FOUND});
        } else {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({
                    status: status.INTERNAL_SERVER_ERROR,
                    error: err.toString()
                });
        }
    });
};

const updateEmployeeGrades = (req, res) => {
    const {_id} = req.params;
    const _grades = req.body;

    _employee.updateOne({_id: _id}, {grade: _grades}, (err, updated) => {
        if (!err && updated) {
            res.status(status.OK)
                .json({status: updated.n ? status.OK : status.NOT_FOUND});
        } else {
            res.status(status.INTERNAL_SERVER_ERROR).json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err.toString()
            });
        }
    });
};

const updateEmployeeGradesAndPositions = (req, res) => {
    const {_id} = req.params;
    const {positions, grades} = req.body;

    _employee.updateOne({_id: _id}, {positions: positions, grade: grades}, (err, updated) => {
        if (!err && updated) {
            res.status(status.OK)
                .json({status: updated.n ? status.OK : status.NOT_FOUND});
        } else {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({
                    status: status.INTERNAL_SERVER_ERROR,
                    error: err.toString()
                });
        }
    });
};

const getEmployeePositions = (req, res) => {
    const {rfc} = req.params;

    _employee.findOne({rfc: rfc}, {_id: 0, 'positions.status': 1})
        .populate(
            {path:'positions.position', model:'Position', select: 'name'})
            .exec(
            (err, data)=> {
                    if(err) {
                        res.json(err);
                    }
                    const activePositions = data.positions
                        .filter(({status}) => status === 'ACTIVE')
                        .map(({position}) => position);
                    res.json(activePositions);
    });
};

const uploadEmployeePositionsByCsv = async (req, res) => {
    const {_employeeId} = req.params;
    const _positions = req.body;
    const activePositionsEmployee = await _getActivePositionsByEmployee(_employeeId);
    const findPosition = (position) => {
        const query = {
            name: { $regex: new RegExp(`^${position.name}$`, 'i') }
        };
        return _position.find(query)
            .populate('ascription')
            .then(data => {
                if (data) {
                    const pos = data.filter(({ascription}) => ascription.name === position.ascription)[0];
                    position._id = pos._id;
                    position.ascriptionId = pos.ascription._id;
                    return position;
                }
            });
    };
    const addPositions = async (position) => {
        if (!await _isActivePosition(activePositionsEmployee, position)) {
            if (position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO' || position.name.toUpperCase() === 'DIRECTOR') {
                if (await _isAssignedDepartmentBoss(position._id) && !position.deactivateDate) {
                    return null;
                }
            }
            const doc = {
                $addToSet: {
                    positions: {
                        position: position._id,
                        activateDate: position.activateDate,
                        deactivateDate: position.deactivateDate ? position.deactivateDate : null,
                        status: position.deactivateDate ? 'INACTIVE' : 'ACTIVE'
                    }
                }
            };
            return _employee.updateOne({_id: _employeeId}, doc);
        }
        return null;
    };
    const actions = _positions.map(findPosition);
    const results = Promise.all(actions);

    results
        .then(data => {
            return Promise.all(data.map(addPositions));
        });
    results
        .then(data => res.status(status.OK).json(data))
        .catch(err => res.status(status.INTERNAL_SERVER_ERROR).json(err));
};

const uploadEmployeeGradesByCsv = (req, res) => {
    const {_employeeId} = req.params;
    const _grades = req.body;
    const addGrade = (grade) => {
        const doc = {
            $addToSet: {
                grade: {
                    title: grade.title,
                    cedula: grade.cedula,
                    abbreviation: grade.abbreviation,
                    level: grade.level
                }
            }
        };
        return _employee.updateOne({_id: _employeeId}, doc);
    };
    const actions = _grades.map(addGrade);
    const results = Promise.all(actions);

    results
        .then(data => res.status(status.OK).json(data))
        .catch(err => res.status(status.INTERNAL_SERVER_ERROR).json(err));
};

const canReallocateBossOrDirector = async (req, res) => {
    const {_positionId} = req.params;

    if (!await _isAssignedDepartmentBoss(_positionId)) {
        res.status(status.OK).json({message: 'Puesto disponible'});
    } else {
        res.status(status.BAD_REQUEST).json({message: 'Puesto no disponible'});
    }
};

const _isActivePosition = (activePositionsEmployee, position) => {
    return new Promise(resolve => {
        const index = activePositionsEmployee.findIndex(
            _position => _position._id === position._id || _position.name.toUpperCase() === position.name.toUpperCase());
        resolve(!position.deactivateDate && index !== -1);
    });
};

const _getActivePositionsByEmployee = (employeeId) => {
    return new Promise(resolve => {
        _employee.findOne({_id: employeeId}, {positions:1})
            .populate('positions.position')
            .then((data) => {
                const activePositions = data.positions
                    .filter(pos => pos.status === 'ACTIVE')
                    .map(pos => pos.position);
                resolve(activePositions);
            })
            .catch(_ => resolve([]));
    });
};

const _isAssignedDepartmentBoss = (positionId) => {
    return new Promise(resolve => {
        const query = {
            positions: {$elemMatch: {$and: [{position: positionId}, {status: 'ACTIVE'}]}}
        };
        _employee.findOne(query)
            .populate('positions.position')
            .then(employee => {
                resolve(!!employee);
            })
            .catch(_ => resolve(false));
    });
};

module.exports = (Employee, Position) => {
    _employee = Employee;
    _position = Position;
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
        getEmployeeByArea,
        updateEmployeePositions,
        updateEmployeeGrades,
        updateEmployeeGradesAndPositions,
        getEmployeePositions,
        uploadEmployeePositionsByCsv,
        uploadEmployeeGradesByCsv,
        canReallocateBossOrDirector,
    });
};
