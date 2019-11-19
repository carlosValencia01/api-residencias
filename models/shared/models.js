const mongoose = require('mongoose');
const _ = require('underscore');
const config = require('../../_config');

module.exports = (wagner) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`, {
        useNewUrlParser: true,
        useCreateIndex: true
    });

    wagner.factory('db', () => mongoose);
    
    // App
    const Department = require('../app/department.model');
    const Folder = require('../app/google-drive-folder.model');
    const Period = require('../app/period.model');
    const Role = require('../app/role.model');
    const User = require('../app/user.model');
    
    // Inscriptions
    const Inscription = require('../inscriptions/inscription.model');
    
    // Reception act
    const Request = require('../reception-act/request.model');
    
    // Shared
    const Employee = require('./employee.model');
    const Student = require('./student.model');
    const Career = require('./career.model');
    
    const models = {
        // App
        Department,
        Period,
        Role,
        User,
        Folder,
        // Inscriptions
        Inscription,
        
        // Reception act
        Request,

        // Shared
        Employee,
        Student,
        Career,
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
};
