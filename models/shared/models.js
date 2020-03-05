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
    const Folder = require('../app/google-drive-folder.model');
    const Period = require('../app/period.model');
    const Role = require('../app/role.model');
    const User = require('../app/user.model');

    // Inscriptions
    const Inscription = require('../inscriptions/inscription.model');

    // Reception act
    const English = require('../reception-act/english.model');
    const Range = require('../reception-act/ranges.models');
    const Request = require('../reception-act/request.model');
    const MinuteBook = require('../reception-act/minuteBook.model');

    // Shared
    const Department = require('./department.model');
    const Document = require('./document.model');
    const Employee = require('./employee.model');
    const Position = require('./position.model');
    const Student = require('./student.model');
    const Career = require('./career.model');
    const IMSS = require('./imss.model');
    
    const models = {
        // App
        Period,
        Role,
        User,
        Folder,

        // Inscriptions
        Inscription,

        // Reception act
        English,
        Range,
        Request,
        MinuteBook,

        // Shared
        Department,
        Document,
        Employee,
        Position,
        Student,
        Career,
        IMSS
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
};
