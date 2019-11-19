const handler = require('../../utils/handler');
const status = require('http-status');


let _career;

const getAll = (req, res) => {
    _career.find({})
        .exec(handler.handleMany.bind(null, 'careers', res));
};


const create = (req, res, next) => {
    const {career} = req.body;
    _career.create(career).then(created => {
        if(created){
            res.status(status.CREATED).json({
                action: 'create career',
                model:'career',
                result:created
            });
        }else{
            res.status(status.BAD_REQUEST).json({
                error: 'career didnt created'
            });            
        }
    }).catch(err =>
        res.status(status.BAD_REQUEST).json({
            error: err.toString()
        })
    );
};

const createMultiple = (req,res)=>{
    const {careers} = req.body;
    _career.insertMany(careers).then(
        result =>{
            res.status(status.OK).json({action:'insert many'});
        }
    ).catch(err=>{res.status(status.BAD_REQUEST).json({error:err.toString()})});
};

const updateOne = (req, res) => {
    const query = { _id: res.body.career };

    _career.findOneAndUpdate(query).exec((err, query) => {
        if (query) {
            handler.handleOne.bind(null, 'careers', res)
        }
    });
};

const getOne = (req, res) => {
    const { _id } = req.params;
    const query = { _id: _id };

    _career.findById(query).then(
        career=>{
            if (!career) {
                res.status(status.NOT_FOUND).json({
                    error: 'No se encontro la carrera.'
                });
            }else{
                res.status(status.OK).json({
                    action:'get career by id',
                    model:'careers',
                    result:career
                });
            }                        
        }
    );
};

module.exports = (Career) => {
    _career = Career;
    return ({
        create,
        getOne,
        updateOne,
        getAll,        
        createMultiple                
    });
};
