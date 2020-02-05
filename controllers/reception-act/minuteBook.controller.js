const status = require('http-status');
let _minuteBook;

const getAllMinuteBooks = (req, res) => {
    _minuteBook.find({})
        .then(minuteBooks => {
            res.status(status.OK).json(minuteBooks);
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al crear el libro'});
        })
};

const createMinuteBook = (req, res) => {
    const {name, number, registerDate, titleOption, careers} = req.body;
    const minuteBook = {
        name: name,
        number: number,
        registerDate: registerDate,
        titleOption: titleOption,
        careers: careers
    };
    _minuteBook.create(minuteBook)
        .then(_ => {
            res.status(status.OK).json({message : 'Libro creado con éxito'});
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al crear el libro'});
        });
};

const changeMinuteBookStatus = (req, res ) => {
    const {_id, status} = req.params;
    _minuteBook.update({_id: _id}, {$set: {status: status}})
        .then(_ => {
            res.status(status.OK).json({message : 'Estatus actualizado con éxito'});
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al actualizar el estatus'});
        });
};

module.exports = (MinuteBook) => {
    _minuteBook = MinuteBook;
    return ({
        getAllMinuteBooks,
        createMinuteBook,
        changeMinuteBookStatus
    });
};

