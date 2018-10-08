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
  path: [`${uri}user/login`, `${uri}user/register`, `${uri}user/send/code`, /^\/escolares\/credenciales\/student/ ]
};

app.use(expressJWT({ secret: config.secret}).unless(jwtOptions));

app.use(uri+'user', user);
app.use(uri+'student', student);


module.exports = app;