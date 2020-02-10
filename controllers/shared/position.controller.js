const handler = require('../../utils/handler');
const status = require('http-status');

let _position;
let _employee;

const getAllPositions = (req, res) => {
    _position.find({})
        .populate({
            path: 'ascription',
            model: 'Department'
        })
        .populate({
            path: 'documents',
            model: 'Document'
        })
        .exec(handler.handleMany.bind(null, 'positions', res));
};

const createPosition = (req, res) => {
    const position = req.body;
    _position.create(position)
        .then(position => res.status(status.OK).json(position))
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err ? err.toString() : 'Error al crear puesto' }));
};

const updatePosition = (req, res) => {
    const { _id } = req.params;
    const position = req.body;
    _position.updateOne({ _id: _id }, position)
        .then(data => {
            if (data && data.n) {
                res.status(status.OK)
                    .json({ message: 'Puesto actualizado con éxito' });
            } else {
                res.status(status.NOT_FOUND)
                    .json({ message: 'Puesto no encontrado' });
            }
        })
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err.toString() }));
};

const removePosition = (req, res) => {
    const { _id } = req.params;
    _employee.find({ 'positions.position': _id })
        .then(employees => {
            if (employees && !employees.length) {
                _position.deleteOne({ _id: _id })
                    .then(deleted => {
                        if (deleted && deleted.n) {
                            res.status(status.OK)
                                .json({ message: 'Puesto borrado con éxito' });
                        } else {
                            res.status(status.NOT_FOUND)
                                .json({ message: 'Puesto no encontrado' });
                        }
                    })
                    .catch(err =>
                        res.status(status.INTERNAL_SERVER_ERROR)
                            .json({ error: err ? err.toString() : 'Error al borrar puesto' }));
            } else {
                res.status(status.INTERNAL_SERVER_ERROR)
                    .json({ message: 'El puesto está asignado' });
            }
        })
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err ? err.toString() : 'Error al borrar puesto' }));
};

const updateDocumentAssign = (req, res) => {
    const { _positionId } = req.params;
    const _documents = req.body.documents;
    _position.updateOne({ _id: _positionId }, { documents: _documents })
        .then(data => {
            if (data && data.n) {
                res.status(status.OK)
                    .json({ message: 'Documentos actualizados con éxito' });
            } else {
                res.status(status.NOT_FOUND)
                    .json({ message: 'Puesto no encontrado' });
            }
        })
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err ? err.toString() : 'Error al actualizar documentos' }));
};

const getPositionsByDepartment = (req, res) => {
    const { _departmentId } = req.params;
    _position.find({ ascription: _departmentId })
        .populate({
            path: 'documents',
            model: 'Document'
        })
        .populate({
            path: 'ascription',
            model: 'Department'
        })
        .exec(handler.handleMany.bind(null, 'positions', res));
};

const getAvailablePositionsByDepartment = async (req, res) => {
    const { _departmentId, _employeeId } = req.params;
    const activePositionsEmployee = await _getActivePositionsByEmployee(_employeeId);
    const departmentBossPosition = await _getDeparmentBossPosition(_departmentId);
    const directorPosition = await _getDirectorPosition(_departmentId);
    let occupiedPositions = [];
    occupiedPositions = (departmentBossPosition ? activePositionsEmployee.concat([departmentBossPosition]) : activePositionsEmployee);
    occupiedPositions = (directorPosition ? occupiedPositions.concat([directorPosition]) : occupiedPositions).map(({ name }) => name.toUpperCase());
    _position.find({ ascription: _departmentId })
        .populate({
            path: 'ascription',
            model: 'Department',
            select: '-careers'
        })
        .select('name ascription canSign')
        .then(data => {
            if (data && data.length) {
                const availablePositions = data.filter(pos => !occupiedPositions.includes(pos.name.toUpperCase()));
                res.status(status.OK)
                    .json(availablePositions);
            } else {
                res.status(status.NOT_FOUND)
                    .json({ message : 'No se encontraron puestos' });
            }
        })
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err ? err.toString() : 'Ocurrió un error' }));
};

const _getActivePositionsByEmployee = (employeeId) => {
    return new Promise(resolve => {
        _employee.findOne({ _id: employeeId })
            .populate({
                path: 'positions.position',
                model: 'Position',
                select: 'name ascription',
            })
            .then(employee => {
                if (employee && employee.positions && employee.positions.length) {
                    const activePositions = employee.positions
                        .filter(pos => pos.status === 'ACTIVE')
                        .map(pos => pos.position);
                    resolve(activePositions);
                } else {
                    resolve([]);
                }
            })
            .catch(_ => resolve([]));
    });
};

const _getDeparmentBossPosition = (departmentId) => {
    return new Promise(resolve => {
        const query = {
            $and: [
                { ascription: departmentId },
                { name: { $regex: new RegExp('^JEFE DE DEPARTAMENTO$', 'i') }}
            ]
        };
        _position.findOne(query)
            .select('name ascription')
            .then(position => {
                if (position) {
                    const query = {
                        positions: {
                            $elemMatch: {
                                $and: [
                                    { position: position._id },
                                    { status: 'ACTIVE' }
                                ]
                            }
                        }
                    };
                    _employee.findOne(query)
                        .populate({
                            path: 'positions.position',
                            model: 'Position',
                            select: 'name ascription'
                        })
                        .then(employee => {
                            if (employee && employee.positions && employee.positions.length) {
                                const position = employee.positions
                                    .filter(({ status, position }) =>
                                        status === 'ACTIVE' && position.name.toUpperCase() === 'JEFE DE DEPARTAMENTO')[0].position;
                                resolve(position);
                            } else {
                                resolve(null);
                            }
                        })
                        .catch(_ => resolve(null));
                } else {
                    resolve(null);
                }
            })
            .catch(_ => resolve(null));
    });
};

const _getDirectorPosition = (departmentId) => {
    return new Promise(resolve => {
        const query = {
            $and: [
                { ascription: departmentId },
                { name: { $regex: new RegExp('^DIRECTOR$', 'i') }}
            ]
        };
        _position.findOne(query)
            .select('name ascription')
            .then(position => {
                if (position) {
                    const query = {
                        positions: {
                            $elemMatch: {
                                $and: [
                                    { position: position._id },
                                    { status: 'ACTIVE' }
                                ]
                            }
                        }
                    };
                    _employee.findOne(query)
                        .populate({
                            path: 'positions.position',
                            model: 'Position',
                            select: 'name ascription'
                        })
                        .then(employee => {
                            if (employee && employee.positions && employee.positions.length) {
                                const position = employee.positions
                                    .filter(({ status, position }) =>
                                        status === 'ACTIVE' && position.name.toUpperCase() === 'DIRECTOR')[0].position;
                                resolve(position);
                            } else {
                                resolve(null);
                            }
                        })
                        .catch(_ => resolve(null));
                } else {
                    resolve(null);
                }
            })
            .catch(_ => resolve(null));
    });
};

const getPositionById = (req, res) => {
    const { positionId } = req.params;
    _position.findOne({ _id: positionId })
        .populate({
            path: 'ascription',
            model: 'Department',
            populate: {
                path: 'careers',
                model: 'Career'
            }
        })
        .then(position => {
            if (position) {
                res.status(status.OK).json(position);
            } else {
                res.status(status.NOT_FOUND).json({ message: 'Puesto no encontrado' });
            }
        })
        .catch(err =>
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ error: err ? err.toString() : 'Error' }));
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
        getPositionsByDepartment,
        getAvailablePositionsByDepartment,
        getPositionById,
    });
};