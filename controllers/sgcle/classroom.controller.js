const handler = require('../../utils/handler');
const status = require('http-status');


let _classroom;

const createClassroom = (req, res) => {
    const classroom = req.body;
    _classroom.create(classroom)
        .then(created => res.status(status.OK).json(created))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Aula' }));
};

const getAllClassroom = (req, res) => {
    _classroom.find({})
        .exec(handler.handleMany.bind(null, 'classrooms', res));
};

const getAvailableClassrooms = (req, res) => {
    const startHour = Number(req.query.startHour);
    const endHour = Number(req.query.endHour);
    const day = Number(req.query.day);
    const minutesSegment = 30; // Minutos de cada segmento
    const totalSegments = (endHour - startHour) / minutesSegment;
    const query = [
        {
            $project: {
                name: 1,
                schedule: {
                    $filter: {
                        input: '$schedule',
                        as: 'schedule',
                        cond: {
                            $and: [
                                { $eq: ['$$schedule.day', day] },
                                { $gte: ['$$schedule.startHour', startHour] },
                                { $lte: ['$$schedule.endDate', endHour] },
                                { $eq: ['$$schedule.status', 'available'] },
                            ],
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                scheduleCount: {
                    $cond: {
                        if: { $isArray: '$schedule' },
                        then: { $size: '$schedule' },
                        else: 0,
                    },
                },
            },
        },
        { $match: { scheduleCount: { $eq: totalSegments } } },
        { $project: { name: 1, } },
    ];

    _classroom.aggregate(query)
        .then((classrooms) => {
            res.status(status.OK).json(classrooms);
        })
        .catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR)
                .json(err || { error_msj: 'Ocurrió un error' });
        });
};

const removeClassroom = (req, res) => {
    const { _id } = req.params;
    _classroom.deleteOne({ _id: _id })
        .then(deleted => res.status(status.OK).json(deleted))
        .catch(_ => res
            .status(status.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error al borrar Aula' }));
};

const updateClassroom = (req, res) => {
    const { _id } = req.params;
    const classroom = req.body;
    _classroom.updateOne({ _id: _id }, { $set: classroom })
        .then(updated => res.status(status.OK).json(updated))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el Aula' }));
};

module.exports = Classroom => {
    _classroom = Classroom;
    return ({
        createClassroom,
        getAllClassroom,
        getAvailableClassrooms,
        removeClassroom,
        updateClassroom
    });
};