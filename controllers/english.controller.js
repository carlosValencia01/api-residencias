const status = require('http-status');

let _english;

const loadData = (req, res) => {
    const student = req.body;

    _english.create(student)
        .then(created => {
            res.json(created);
        })
        .catch(err => {
            res.json({
                error: err.toString(),
                status: status.INTERNAL_SERVER_ERROR
            });
        });
};

const validateControlNumber = (req, res) => {
    const {controlNumber} = req.params;

    _english.findOne({controlNumber: controlNumber}, (err, doc) => {
        if (!err && doc) {
            return res.json({
                ok: true,
                data: doc,
                status: status.OK
            });
        }
        res.json({
            ok: false,
            error: 'No se encontró el número de control',
            status: status.NOT_FOUND
        });
    });
};

module.exports = (English) => {
    _english = English;
    return ({
        validateControlNumber,
        loadData,
    });
};
