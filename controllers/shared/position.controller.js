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
    });
};
