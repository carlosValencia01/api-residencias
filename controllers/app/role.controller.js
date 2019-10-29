const handler = require('../../utils/handler');
let _role;

const getAll = (req, res) => {                
    _role.find({}).exec(handler.handleMany.bind(null, 'role', res));
};

module.exports = (Role) => {
    _role = Role;
    return ({
      getAll
    });
};
