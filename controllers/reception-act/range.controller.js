const handler = require('../../utils/handler');
const status = require('http-status');
let _range;


const getAll = (req, res) => {
    _range.find({}).exec(handler.handleMany.bind(null, 'ranges', res));
};

const create = (req, res, next) => {

    const range = req.body;    
    _range.create(range).then(created => {
        res.json({
            range: created
        });
    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    );
};

const update = (req, res) => {
    const { _id } = req.params;
    const range = req.body;

    const query = { _id: _id };
    _range.findOneAndUpdate(query, range, { new: true })
        .exec(handler.handleOne.bind(null, 'range', res));
};

const remove = (req, res) => {
    const { _id } = req.params;
    _range.deleteOne({ _id: id }, function (error) {
        if (error)
            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.toString() });
        return res.status(200).json({ message: "Successful" });
    });
};
module.exports = (Range) => {
    _range = Range;
    return ({
        update,
        create,
        remove,
        getAll
    });
};