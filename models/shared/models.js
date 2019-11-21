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
    const Period = require('../app/period.model');
    const Role = require('../app/role.model');
    const User = require('../app/user.model');

    // Inscriptions
    const Inscription = require('../inscriptions/inscription.model');

    // Reception act
    const Request = require('../reception-act/request.model');
    const Range = require('../reception-act/ranges.models');
    // Shared
    const Employee = require('./employee.model');
    const Student = require('./student.model');

    const models = {
        // App
        Department,
        Period,
        Role,
        User,

        // Inscriptions
        Inscription,

        // Reception act
        Request,

        // Shared
        Employee,
        Student,
        Range
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
};
