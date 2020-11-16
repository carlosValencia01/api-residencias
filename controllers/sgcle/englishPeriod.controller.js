const handler = require('../../utils/handler');
const status = require('http-status');

let _englishPeriod;

const createEnglishPeriod = (req, res) => {
    const englishPeriod = req.body;
    _englishPeriod.create(englishPeriod)
        .then(created => res.status(status.OK).json(created))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear Periodo de Ingles' }));
};

const updateEnglishPeriod = (req, res) => {
    const { _id } = req.params;
    const englishPeriod = req.body;
    _englishPeriod.updateOne({ _id: _id }, { $set: englishPeriod })
        .then(updated => res.status(status.OK).json(updated))
        .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar Periodo de Ingles' }));
};

const getAllEnglishPeriod = (req, res) => {
    _englishPeriod.find({}).populate({
        path: 'period', model: 'Period',
      })
        .exec(handler.handleMany.bind(null, 'englishPeriods', res));
};

const inEnglishPeriod = (req, res) => {
    const { _option } = req.params;
    const nowDate = new Date();
    _englishPeriod.findOne({ active: true })
        .then(period => {
            if (period) {
                let initDate;
                let endDate;
                switch (_option) {
                    case 'request':
                        initDate = period.reqPerInitDate;
                        endDate = period.reqPerEndDate;
                        break;
                    case 'secondRequest':
                        initDate = period.secReqPerInitDate;
                        endDate = period.secReqPerEndDate;
                        break;
                    case 'evaluation':
                        initDate = period.evaPerInitDate;
                        endDate = period.evaPerEndDate;
                        break;
                }
                if (moment(nowDate).isBetween(initDate, endDate)) {
                    res.status(status.OK).json({ active: true });
                } else {
                    res.status(status.OK).json({ active: false });
                }
            } else {
                res.status(status.NOT_FOUND).json({ model: 'englishPeriod', action: 'get active', error: 'There are not any periods active' });
            }
        }).catch(error => {
            res.status(status.BAD_REQUEST).json({
                model: 'englishPeriod', action: 'get english period', error: error.toString()
            });
        });
};

module.exports = EnglishPeriod => {
    _englishPeriod = EnglishPeriod;
    return ({
        createEnglishPeriod,
        updateEnglishPeriod,
        getAllEnglishPeriod,
        inEnglishPeriod
    });
};