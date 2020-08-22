const bodyParser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const morgan = require('morgan');
const wagner = require('wagner-core');
const config = require('./_config');
const URL = `/escolares`;
const fileUpload = require('express-fileupload');

// MODELS
require('./models/shared/models')(wagner);

// ROUTES
const routes = require('./routes')(wagner);

let app = express();

app.use(morgan('dev'));
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000
}));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  next();
});

// ROUTERS
const v = 'credenciales';
const uri = `${URL}/${v}/`;

const jwtOptions = {
  path: [
    `${uri}user/login`,
    `${uri}user/register`,
    `${uri}user/student/login`, // app inscripciones
    `${uri}user/graduation/login`, //app graduacion
    `${uri}drive/upload/file`,
    `${uri}student/notify`,
    `${uri}student/schedule`,
    /^\/escolares\/credenciales\/graduationmail\/.*/,
    /^\/escolares\/credenciales\/student\/image\/.*/,
    /^\/escolares\/credenciales\/employee\/image\/.*/,
  ]
};
// files
app.use(fileUpload({
  limits: { fileSize: "50mb" }
}));
app.use(expressJWT({
  secret: config.secret
}).unless(jwtOptions));

// Add routes
routes.forEach((item) =>
  app.use(`${uri}${item.route}`, item.router));

module.exports = app;
