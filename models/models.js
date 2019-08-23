const mongoose = require('mongoose');
const _ = require('underscore');
const config = require('../_config');

module.exports = (wagner) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`, {
        useNewUrlParser: true,
        useCreateIndex: true
    });

    wagner.factory('db', () => mongoose);
    const User = require('./user.model');
    const Student = require('./student.model');
    const Employee = require('./employee.model');
    const Inscription = require('./inscription.model');
    const Period= require('./period.model');

    const models = {
        User,
        Student,
        Employee,
        Inscription,
        Period
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
}
