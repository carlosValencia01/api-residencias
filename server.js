const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const wagner = require('wagner-core');
// const path = require('path');
const expressJWT = require('express-jwt');
const config = require('./_config');

const URL = `/escolares`;

// MODELS
require('./models/models')(wagner);

const user = require('./routers/user.router')(wagner);
const student = require('./routers/student.router')(wagner);
const employee = require('./routers/employee.router')(wagner);
const english = require('./routers/english.router')(wagner);
const role = require('./routers/role.router')(wagner);
const mail = require('./routers/mail.router')(wagner);
const request = require('./routers/request.router')(wagner);
const department = require('./routers/department.router')(wagner);

let app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
        `${uri}user/login`, `${uri}user/register`, `${uri}student/login`, 
        `${uri}student/create`, `${URL}/sendmail`, `${uri}employee/create`,
        `${uri}user/send/code`, /^\/escolares\/credenciales\/student\/image\/.*/,
        /^\/escolares\/credenciales\/employee\/image\/.*/ 
      ]
};

//app.use(expressJWT({ secret: config.secret}).unless(jwtOptions));

app.use(uri+'user', user);
console.log("uri"+uri);
app.use(uri+'student', student);
app.use(uri+'employee', employee);
app.use(uri+'english', english);
app.use(uri+'role', role);
app.use(uri+'request', request);
app.use(uri+'department',department);
app.use(URL+'/sendmail', mail);
module.exports = app;