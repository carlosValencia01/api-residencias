const mongoose = require('mongoose');
const _ = require('underscore');
const config = require('../../_config');

module.exports = (wagner) => {
    mongoose.Promise = global.Promise;
    mongoose
        .connect(`mongodb://${config.dbhost}:${config.dbport}/${config.dbname}`,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
            })
        .then(() => console.log('Connected'))
        .catch((err) => console.log(err));

    wagner.factory('db', () => mongoose);

    // App
    const Folder = require('../app/google-drive-folder.model');
    const Period = require('../app/period.model');
    const Role = require('../app/role.model');
    const User = require('../app/user.model');
    const Permission = require('../app/permission.model');

    // Inscriptions
    const Inscription = require('../inscriptions/inscription.model');
    const WelcomeData = require('../inscriptions/welcomeData.model');


    // Reception act
    const English = require('../reception-act/english.model');
    const Range = require('../reception-act/ranges.models');
    const Request = require('../reception-act/request.model');
    const MinuteBook = require('../reception-act/minuteBook.model');
    const DenyDay = require('../reception-act/denyDays.model');

    // Vinculation
    const Company = require('../vinculation/company.model');

    // Shared
    const Department = require('./department.model');
    const Document = require('./document.model');
    const Employee = require('./employee.model');
    const Position = require('./position.model');
    const Student = require('./student.model');
    const Career = require('./career.model');
    const IMSS = require('./imss.model');
    const ActiveStudents = require('./activeStudents.model');
    const Schedule = require('./schedule.model');

    // SG-CLE
    const EnglishCourse = require('./../sgcle/englishCourse.model')
    const EnglishStudent = require('./../sgcle/englishStudent.model');
    const Group = require('./../sgcle/group.model');

    const RequestCourse = require('./../sgcle/requestCourse.model');
    const Classroom = require('./../sgcle/classroom.model');
    const EnBossMessage = require('./../sgcle/bossMessage.model');
    const EnglishPeriod = require('./../sgcle/englishPeriod.model');

    const models = {
        // App
        Period,
        Role,
        User,
        Folder,
        Permission,

        // Inscriptions
        Inscription,
        WelcomeData,

        // Reception act
        English,
        Range,
        Request,
        MinuteBook,
        DenyDay,

        // Vinculation
        Company,

        // Shared
        Department,
        Document,
        Employee,
        Position,
        Student,
        Career,
        IMSS,
        ActiveStudents,
        Schedule,

        // SG-CLE
        EnglishCourse,
        EnglishStudent,
        Group,
        RequestCourse,
        Classroom,
        EnBossMessage,
        EnglishPeriod
    };

    _.each(models, (v, k) => {
        wagner.factory(k, () => v);
    });
};
