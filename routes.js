module.exports = (wagner) => {
  // ROUTERS
  const routers = require('./routers')(wagner);

  return [
    // App
    { route: 'role', router: routers.role },
    { route: 'user', router: routers.user },
    { route: 'period', router: routers.period },
    { route: 'drive', router: routers.drive },
    { route: 'career', router: routers.career },
    { route: 'permission', router: routers.permission },
    // Credentials
    { route: 'employee', router: routers.employee },
    { route: 'student', router: routers.student },
    // Inscriptions
    { route: 'inscription', router: routers.inscription },
    // Reception act
    { route: 'english', router: routers.english },
    { route: 'request', router: routers.request },
    { route: 'range', router: routers.range },
    { route: 'denyDay', router: routers.denyDay },
    { route: 'minuteBook', router: routers.minuteBook },
    // Graduations
    { route: 'graduationmail', router: routers.graduation },
    // Shared
    { route: 'department', router: routers.department },
    { route: 'document', router: routers.document },
    { route: 'employee', router: routers.employee },
    { route: 'position', router: routers.position },
    { route: 'student', router: routers.student },
    { route: 'imss', router: routers.imss },
    // Schedule
    { route: 'schedule', router: routers.schedule },
  ];
};
