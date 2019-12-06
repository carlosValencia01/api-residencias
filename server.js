const bodyParser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const morgan = require('morgan');
const wagner = require('wagner-core');
const config = require('./_config');
// const URL = `/escolares`;
const URL = `/api`;
const fileUpload = require('express-fileupload');
// MODELS
require('./models/shared/models')(wagner);

// App
const department = require('./routers/app/department.router')(wagner);
const role = require('./routers/app/role.router')(wagner);
const user = require('./routers/app/user.router')(wagner);
const period = require('./routers/app/period.router')(wagner);
const drive = require('./routers/app/google-drive.router')(wagner);

// Inscriptions
const inscription = require('./routers/inscriptions/inscription.router')(wagner);

// Reception act
const english = require('./routers/reception-act/english.router')(wagner);
const request = require('./routers/reception-act/request.router')(wagner);

// Graduation
const graduation = require('./routers/graduation/graduation.router')(wagner);

// Shared
const employee = require('./routers/shared/employee.router')(wagner);
const student = require('./routers/shared/student.router')(wagner);
const career = require('./routers/shared/career.router')(wagner);

let app = express();


app.use(morgan('dev'));
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit:50000
}));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  next();
});

// ROUTERS
// const v = 'credenciales';
const v = 'v1';
const uri = `${URL}/${v}/`;

const jwtOptions = {
  path: [
    `${uri}user/login`, `${uri}user/register`,`${uri}user/student/login` ,`${uri}student/login`, `/favicon.ico`,
    `${uri}student/create`, `${uri}inscription/updateStudent`, `${uri}graduationmail`, `${uri}employee/create`, `${uri}user/send/code`,
    `${uri}inscription/sendmail`, `${uri}english`, `${uri}request`, `${uri}role`, `${uri}department`, `${uri}period/create` ,`${uri}drive/upload`,`${uri}drive/upload/file`,
    /^\/escolares\/credenciales\/student\/image\/.*/,
    /^\/escolares\/credenciales\/student\/document\/.*/,
    /^\/escolares\/credenciales\/employee\/image\/.*/,
    /^\/escolares\/credenciales\/graduationmail\/.*/,
    /^\/escolares\/credenciales\/request\/.*/,
    /^\/escolares\/credenciales\/user\/.*/,    
  ]
};
//files
app.use(fileUpload({
    limits: { fileSize: 1000000 }
}));
app.use(expressJWT({
  secret: config.secret
}).unless(jwtOptions));

// App
app.use(uri + 'department', department);
app.use(uri + 'role', role);
app.use(uri + 'user', user);
app.use(uri + 'period', period);
app.use(uri + 'drive', drive);
app.use(uri + 'career', career);

// Credentials
app.use(uri + 'employee', employee);
app.use(uri + 'student', student);

// Inscriptions
app.use(uri + 'inscription', inscription);

// Reception act
app.use(uri + 'english', english);
app.use(uri + 'request', request);

// Graduations
app.use(uri + 'graduationmail', graduation);

module.exports = app;
