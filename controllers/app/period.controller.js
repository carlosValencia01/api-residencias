const status = require('http-status');
const handler = require('../../utils/handler');
let _period;

const getAll = (req, res) => { 
  _period.find({}).exec(handler.handleMany.bind(null, 'periods', res));
};

const createPeriod = (req,res)=> {
    console.log('period');
    
    const period = req.body;
    _period.create(period).then(created => {
        res.status(status.OK).json({
            period: created,        
            action: 'create'
        });

    }).catch(err =>{
        console.log(err.toString());
        
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        })
    });
};

const updatePeriod = (req,res)=> {
    
    const period = req.body;
    console.log('period updaet',period);
    const idPeriod = req.params.id;
    _period.findOneAndUpdate({_id:idPeriod},period).then(updated => {
        res.status(status.OK).json({
            period: updated,        
            action: 'updated'
        });

    }).catch(err =>
        res.status(status.BAD_REQUEST).json({
            error: err.toString()
        }));
};

module.exports = (Period) => {
  _period = Period;
  return ({
    getAll,
    createPeriod,
    updatePeriod
  });
};
