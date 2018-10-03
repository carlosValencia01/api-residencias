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


    const models = {
        User,
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
}
