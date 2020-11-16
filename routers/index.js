module.exports = (wagner) => {
  return {
    // App
    role: require('./app/role.router')(wagner),
    user: require('./app/user.router')(wagner),
    period: require('./app/period.router')(wagner),
    drive: require('./app/google-drive.router')(wagner),
    permission: require('./app/permission.router')(wagner),
    // Inscriptions
    inscription: require('./inscriptions/inscription.router')(wagner),
    // Reception act
    english: require('./reception-act/english.router')(wagner),
    request: require('./reception-act/request.router')(wagner),
    range: require('./reception-act/range.router')(wagner),
    minuteBook: require('./reception-act/minuteBook.router')(wagner),
    denyDay: require('./reception-act/denyDays.router')(wagner),
    // Graduation
    graduation: require('./graduation/graduation.router')(wagner),
    // Shared
    department: require('./shared/department.router')(wagner),
    document: require('./shared/document.router')(wagner),
    employee: require('./shared/employee.router')(wagner),
    position: require('./shared/position.router')(wagner),
    student: require('./shared/student.router')(wagner),
    career: require('./shared/career.router')(wagner),
    imss: require('./shared/imss.router')(wagner),
    // Schedule
    schedule: require('./schedule/schedule.router')(wagner),
    // SG-CLE
    englishStudent: require('./sgcle/englishStudent.router')(wagner),
    englishCourse: require('./sgcle/englishCourse.router')(wagner),
    group: require('./sgcle/group.router')(wagner),
    requestCourse: require('./sgcle/requestCourse.router')(wagner),
    classroom: require('./sgcle/classroom.router')(wagner),
    englishPeriod: require('./sgcle/englishPeriod.router')(wagner),
    // Social-Service
    controlStudent: require('./social-service/control.router')(wagner)
  };
};
