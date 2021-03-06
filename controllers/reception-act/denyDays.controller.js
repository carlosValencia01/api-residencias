const status = require('http-status');
const _socket = require('../../sockets/app.socket');
const eSocket = require('../../enumerators/shared/sockets.enum');
let _denyDay;

const getAll = async (req, res) => {
   const result = await get();
   if(result.err){
        return res.status(status.BAD_REQUEST).json({error:result.err})
   }else if(result.msg){
        return res.status(status.NOT_FOUND).json(result.msg);
   }
   return res.status(status.OK).json(result);
};

const get = async ()=>{
    return new Promise( (async (resolve)=>{
        await new Promise( (resolve)=>{
            _denyDay.deleteMany({date:{ $lt: new Date() }}).then( deleted=>resolve(true),err=>resolve(true)).catch(err=>resolve(true))
        });
        _denyDay.find({}).then(
            (dates)=>{
                if(dates){                
                 return  resolve(dates);
                }
                return resolve({msg:"No hay días bloqueados"})
            },
            (err)=> resolve({err})
        ).catch( error=>resolve({err:error.toString()}));
    }));
};

const create = (req, res, next) => {

    const day = req.body;     
    _denyDay.create(day).then(created => {
        _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{denyDay:true});
        res.json({
            denyDay: created
        });
    }).catch(err =>
        res.status(status.BAD_REQUEST).json({
            error: err.toString()
        })
    );
};

const remove = (req,res)=>{
    const {_id} = req.body;
    _denyDay.deleteOne({_id}).then(
        (deleted) => {res.status(status.OK).json({msg:"Día desbloqueado"}); _socket.broadcastEmit(eSocket.recActEvents.MODIFY_DIARY,{denyDay:false});},
        (error) => res.status(status.BAD_REQUEST).json({error})
    ).catch((error) => res.status(status.BAD_REQUEST).json({error}));
};

module.exports = (DenyDay) => {
    _denyDay = DenyDay;
    return ({        
        create,        
        getAll,
        get,
        remove
    });
};