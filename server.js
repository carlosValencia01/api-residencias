const bodyParser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const morgan = require('morgan');
const wagner = require('wagner-core');
const URL = `/escolares`;
const config = require('./_config');
// MODELS
require('./models/models')(wagner);

const user = require('./routers/user.router')(wagner);
const student = require('./routers/student.router')(wagner);
const employee = require('./routers/employee.router')(wagner);
const inscription = require('./routers/inscription.router')(wagner);
const graduation = require('./routers/graduation.router')(wagner);
const graduate = require('./routers/graduate.router')(wagner);
const english = require('./routers/english.router')(wagner);
const role = require('./routers/role.router')(wagner);
// const mail = require('./routers/mail.router')(wagner);
const request = require('./routers/request.router')(wagner);
const department = require('./routers/department.router')(wagner);

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
    `${uri}student/create`, `${uri}graduationmail`, `${uri}employee/create`,
    `${uri}user/send/code`, `${uri}inscription/sendmail`, `${uri}graduate/request`, `${uri}english`,
    /^\/escolares\/credenciales\/student\/image\/.*/,
    /^\/escolares\/credenciales\/employee\/image\/.*/,
    /^\/escolares\/credenciales\/graduationmail\/.*/,
    /^\/escolares\/credenciales\/graduate\/.*/,
    /^\/escolares\/credenciales\/english\/.*/,
  ]
};

app.use(expressJWT({
  secret: config.secret
}).unless(jwtOptions));


app.use(uri + 'graduationmail', graduation);
app.use(uri + 'graduate', graduate);
// app.use(URL+'/sendmail', mail);
app.use(uri + 'user', user);
console.log("uri" + uri);
app.use(uri + 'student', student);
app.use(uri + 'employee', employee);
app.use(uri + 'english', english);
app.use(uri + 'role', role);
app.use(uri + 'request', request);
app.use(uri + 'department',department);
module.exports = app;
