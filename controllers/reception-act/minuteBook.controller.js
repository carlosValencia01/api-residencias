const status = require('http-status');
let _minuteBook;

const getAllMinuteBooks = (req, res) => {
    _minuteBook.find({})
        .populate('careers')
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
    const {_id} = req.params;
    const {_status} = req.body;
    _minuteBook.update({_id: _id}, {$set: {status: _status}})
        .then(_ => {
            res.status(status.OK).json({message : 'Estatus actualizado con éxito'});
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al actualizar el estatus'});
        });
};

const getAllActiveMinuteBooks = (req, res) => {
    _minuteBook.find({ "status": true })
        .populate('careers')
        .then(minuteBooks => {
            res.status(status.OK).json(minuteBooks);
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al crear el libro'});
        })
};

const getActiveBookByCareer = (req, res) => {
    const { _careerId,titleOption } = req.params;
    const query = {
        $and: [
            { careers: _careerId },
            { status: true },
            {titleOption}
        ]
    };
    _minuteBook.findOne(query)
        .then(book => {
            if (book) {
                return res.status(status.OK).json(book);
            }
            return res.status(status.NOT_FOUND).json({ message: 'No existe libro activo' });
        })
        .catch(_ => {
            console.log(_);
            
            res.status(status.INTERNAL_SERVER_ERROR)
                .json({ message: 'Error al buscar libro' })
        })       ;
};

const updateMinuteBook = (req, res ) => {
    const { _id } = req.params;
    let book = req.body;
    const query = { _id: _id }

    _minuteBook.update(query, {$set: book.data})
        .then(_ => {
            res.status(status.OK).json({message : 'Libro actualizado con éxito'});
        })
        .catch(error => {
            res.status(status.INTERNAL_SERVER_ERROR).json({error : error, message : 'Ocurrió un error al actualizar el libro'});
        });
};

module.exports = (MinuteBook) => {
    _minuteBook = MinuteBook;
    return ({
        getAllMinuteBooks,
        createMinuteBook,
        changeMinuteBookStatus,
        getAllActiveMinuteBooks,
        getActiveBookByCareer,
        updateMinuteBook
    });
};

