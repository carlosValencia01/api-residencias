const handler = require('../../utils/handler');
const status = require('http-status');

let _position;
let _employee;

const getAllPositions = (req, res) => {
    _position.find({})
        .populate({ path: 'ascription', model: 'Department'})
        .populate({ path: 'documents', model: 'Document' })
        .exec(handler.handleMany.bind(null, 'positions', res));
};

const createPosition = (req, res) => {
    const position = req.body;
    _position.create(position)
        .then(position => res.json(position))
        .catch(err => res.json({
            status: status.INTERNAL_SERVER_ERROR,
            error: err.toString()
        }));
};

const updatePosition = (req, res) => {
    const { _id } = req.params;
    const position = req.body;
    _position.updateOne({ _id: _id }, position, (err, data) => {
        if (!err && data) {
            res.json({ status: data.n ? status.OK : status.NOT_FOUND });
        } else {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err.toString()
            });
        }
    });
};

const removePosition = (req, res) => {
    const { _id } = req.params;
    _employee.find({ positions: _id }, (err, position) => {
        if (!err && !position.length) {
            _position.deleteOne({ _id: _id }, (err, deleted) => {
                if (!err && deleted) {
                    res.json({ status: deleted.n && deleted.deletedCount ? status.OK : status.NOT_FOUND });
                } else {
                    res.json({
                        status: status.INTERNAL_SERVER_ERROR,
                        error: err ? err.toString() : 'No se pudo borrar la posición'
                    });
                }
            });
        } else {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err ? err.toString() : 'La posición está asignada'
            });
        }
    });
};

const updateDocumentAssign = (req, res) => {
    const { _positionId } = req.params;
    const _documents = req.body.documents;
    _position.updateOne({ _id: _positionId }, { documents: _documents }, (err, data) => {
        if (!err && data) {
            res.json({ status: data.n ? status.OK : status.NOT_FOUND });
        } else {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err.toString()
            });
        }
    })
};

const getPositionsForDepartment = (req, res) => {
    const { _departmentId } = req.params;
    _position.find({ ascription: _departmentId })
        .populate({ path: 'documents', model: 'Document' })
        .populate({ path: 'ascription', model: 'Department' })
        .exec(handler.handleMany.bind(null, 'positions', res));
};

const getAvailablePositionsByDepartment = async (req, res) => {
    const { _departmentId, _employeeId } = req.params;
    const activePositionsEmployee = await _getActivePositionsByEmployee(_employeeId);
    const departmentBoss = await _getDeparmentBoss(_departmentId);
    const occupiedPositions = (departmentBoss ? activePositionsEmployee.concat([departmentBoss]) : activePositionsEmployee).map(({name}) => name.toUpperCase());
    _position.find({ascription: _departmentId})
        .populate({path: 'ascription', model: 'Department', select: '-careers'})
        .select('name ascription canSign')
        .exec((err, data) => {
           if (!err && data) {
               const availablePositions = data.filter(pos => !occupiedPositions.includes(pos.name.toUpperCase()));
                res.status(status.OK)
                    .json(availablePositions);
           } else {
               res.status(status.INTERNAL_SERVER_ERROR)
                   .json({error: err ? err.toString() : 'Ocurrió un error'})
           }
        });
};

const _getActivePositionsByEmployee = (employeeId) => {
    return new Promise(resolve => {
        _employee.findOne({_id: employeeId})
            .populate({
                path: 'positions.position', model: 'Position', select: 'name ascription',
            })
            .exec((err, data) => {
                if (!err && data) {
                    const activePositions = data.positions
                        .filter(pos => pos.status === 'ACTIVE')
                        .map(pos => pos.position);
                    resolve(activePositions);
                } else {
                    resolve([]);
                }
            });
    });
};

const _getDeparmentBoss = (departmentId) => {
    return new Promise(resolve => {
        const query = {
            $and: [
                {ascription: departmentId},
                {name: {$regex: new RegExp('^JEFE DE DEPARTAMENTO$', 'i') }}
            ]
        };
        _position.findOne(query)
            .select('name ascription')
            .exec((err, data) => {
                if (!err && data) {
                    const query = {
                        positions: {$elemMatch: {$and: [{position: data._id}, {status: 'ACTIVE'}]}}
                    };
                    _employee.findOne(query)
                        .populate({path: 'positions.position', model: 'Position', select: 'name ascription'})
                        .exec((err, data) => {
                            if (!err && data) {
                                const position = data.positions
                                    .filter(({status, position}) => status === 'ACTIVE' && position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO')[0].position;
                                resolve(position);
                            } else {
                                resolve(null);
                            }
                        });
                }
            });
    });
};

module.exports = (Position, Employee) => {
    _position = Position;
    _employee = Employee;
    return ({
        getAllPositions,
        createPosition,
        updatePosition,
        removePosition,
        updateDocumentAssign,
        getPositionsForDepartment,
        getAvailablePositionsByDepartment,
    });
};
