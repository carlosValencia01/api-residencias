const status = require('http-status');
let _period;

const getAll = async (req, res) => {
    const periods = await constultAll();
    if(periods.err){
        return res.status(status.BAD_REQUEST).json({error:periods.err});
    }
    return res.status(status.OK).json({periods});  
};

const constultAll = ()=>{
    return new Promise((resolve)=>{
        _period.find({}).then(
            periods=>{
                resolve(periods);
            }
        ).catch(err=>{
            resolve({err});
        })
    });
};

const getActivePeriod = (req,res)=>{
    _period.findOne({active:true})
        .then( period=>{
            if(period) {
                res.status(status.OK).json({model:'period',action:'get active',period:period});
            }else{
                res.status(status.NOT_FOUND).json({model:'period',action:'get active', error:'There are not any periods active'});
            } 
        }).catch( error=>{
            res.status(status.BAD_REQUEST).json({
                model:'period',action:'get active', error: error.toString()
            });
        });
};

const createPeriod = (req,res)=> {
       
    let period = req.body;
    // console.log(period);
    
    period.code =  period.periodName === 'ENERO-JUNIO' ? period.year+'1' : period.year+'3';
    _period.create(period).then(created => {
        res.status(status.OK).json({
            period: created,
            model:'period',         
            action: 'create'
        });

    }).catch(err =>{            
        console.log("Error", err);
        res.status(status.BAD_REQUEST).json({
            model:'period',action:'create', error: err.toString()
        });
    });
};

const updatePeriod = (req,res)=> {
    
    const period = req.body;
    
    const idPeriod = req.params.id;
    _period.updateOne({_id:idPeriod},{$set:period}).then(updated => {
        res.status(status.OK).json({
            model:'period', 
            period: updated,        
            action: 'updated'
        });

    }).catch(err =>
        res.status(status.BAD_REQUEST).json({
            model:'period',action:'updated', error: err.toString()
        }));
};

module.exports = (Period) => {
  _period = Period;
  return ({
    getAll,
    getActivePeriod,
    createPeriod,
    updatePeriod,
    constultAll
  });
};
