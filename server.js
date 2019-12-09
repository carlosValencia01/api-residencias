const bodyParser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const morgan = require('morgan');
const wagner = require('wagner-core');
const config = require('./_config');
const URL = `/escolares`;

// MODELS
require('./models/shared/models')(wagner);

// App
const department = require('./routers/app/department.router')(wagner);
const role = require('./routers/app/role.router')(wagner);
const user = require('./routers/app/user.router')(wagner);

// Inscriptions
const inscription = require('./routers/inscriptions/inscription.router')(wagner);

// Reception act
const english = require('./routers/reception-act/english.router')(wagner);
const request = require('./routers/reception-act/request.router')(wagner);
const range = require('./routers/reception-act/range.router')(wagner);
// Graduation
const graduation = require('./routers/graduation/graduation.router')(wagner);

// Shared
const document = require('./routers/shared/document.router')(wagner);
const employee = require('./routers/shared/employee.router')(wagner);
const position = require('./routers/shared/position.router')(wagner);
const student = require('./routers/shared/student.router')(wagner);

let app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ROUTERS
const v = 'credenciales';
const uri = `${URL}/${v}/`;

const jwtOptions = {
  path: [
    `${uri}user/login`, `${uri}user/register`, `${uri}student/login`, `/favicon.ico`,
    `${uri}student/create`, `${uri}graduationmail`, `${uri}employee/create`, `${uri}user/send/code`,
    `${uri}inscription/sendmail`, `${uri}english`, `${uri}request`, `${uri}role`, `${uri}department/employees`,
    `${uri}document`, `${uri}position`, `${uri}department/all`,
    /^\/escolares\/credenciales\/student\/image\/.*/,
    /^\/escolares\/credenciales\/student\/document\/.*/,
    /^\/escolares\/credenciales\/employee\/image\/.*/,
    /^\/escolares\/credenciales\/graduationmail\/.*/,
    /^\/escolares\/credenciales\/request\/.*/,
    /^\/escolares\/credenciales\/user\/.*/,
    /^\/escolares\/credenciales\/document\/.*/,
    /^\/escolares\/credenciales\/position\/.*/,
  ]
};

app.use(expressJWT({
  secret: config.secret
}).unless(jwtOptions));

// App
app.use(uri + 'department', department);
app.use(uri + 'role', role);
app.use(uri + 'user', user);
// Inscriptions
app.use(uri + 'inscription', inscription);
// Reception act
app.use(uri + 'english', english);
app.use(uri + 'request', request);
app.use(uri + 'range', range);
// Graduations
app.use(uri + 'graduationmail', graduation);
// Shared
app.use(uri + 'document', document);
app.use(uri + 'employee', employee);
app.use(uri + 'position', position);
app.use(uri + 'student', student);

module.exports = app;
