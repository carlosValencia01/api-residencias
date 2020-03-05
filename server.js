const bodyParser = require('body-parser');
const express = require('express');
const expressJWT = require('express-jwt');
const morgan = require('morgan');
const wagner = require('wagner-core');
const config = require('./_config');
const URL = `/escolares`;
// const URL = `/api`;
const fileUpload = require('express-fileupload');
// MODELS
require('./models/shared/models')(wagner);

// App
const role = require('./routers/app/role.router')(wagner);
const user = require('./routers/app/user.router')(wagner);
const period = require('./routers/app/period.router')(wagner);
const drive = require('./routers/app/google-drive.router')(wagner);

// Inscriptions
const inscription = require('./routers/inscriptions/inscription.router')(wagner);

// Reception act
const english = require('./routers/reception-act/english.router')(wagner);
const request = require('./routers/reception-act/request.router')(wagner);
const range = require('./routers/reception-act/range.router')(wagner);
const minuteBook = require('./routers/reception-act/minuteBook.router')(wagner);
// Graduation
const graduation = require('./routers/graduation/graduation.router')(wagner);

// Shared
const department = require('./routers/shared/department.router')(wagner);
const document = require('./routers/shared/document.router')(wagner);
const employee = require('./routers/shared/employee.router')(wagner);
const position = require('./routers/shared/position.router')(wagner);
const student = require('./routers/shared/student.router')(wagner);
const career = require('./routers/shared/career.router')(wagner);
const imss = require('./routers/shared/imss.router')(wagner);

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
const v = 'credenciales';
// const v = 'v1';
const uri = `${URL}/${v}/`;

const jwtOptions = {
  path: [
    `${uri}user/login`, 
    `${uri}user/register`,
    `${uri}user/student/login` , // app inscripciones
    `${uri}user/graduation/login`, //app graduacion
    `${uri}drive/upload/file`,
    `${uri}student/notify`, 
    /^\/escolares\/credenciales\/graduationmail\/.*/,
    /^\/escolares\/credenciales\/student\/image\/.*/,
    /^\/escolares\/credenciales\/employee\/image\/.*/,
    // /^\/escolares\/credenciales\/request\/.*/,
    // `${uri}graduationmail`,  
    // `${uri}inscription/updateStudent`, 
    // `${uri}inscription/sendmail`, 
    // `${uri}student/create`, 
    // `${uri}english`, 
    // `${uri}student/login`, 
    // `${uri}department/employees`, 
    // `${uri}document`, 
    // `${uri}position`, 
    // `${uri}department/all`, 
    // /^\/escolares\/credenciales\/student\/document\/.*/,
    // /^\/escolares\/credenciales\/user\/.*/,
    // /^\/escolares\/credenciales\/document\/.*/,
    // /^\/escolares\/credenciales\/position\/.*/,
    // `/favicon.ico`,
    // `${uri}request`, `${uri}role`,
  ]
};
// files
app.use(fileUpload({
  limits: { fileSize: "50mb" }
}));
app.use(expressJWT({
  secret: config.secret
}).unless(jwtOptions));

// App
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
app.use(uri + 'range', range);
app.use(uri + 'minuteBook', minuteBook);
// Graduations
app.use(uri + 'graduationmail', graduation);
// Shared
app.use(uri + 'department', department);
app.use(uri + 'document', document);
app.use(uri + 'employee', employee);
app.use(uri + 'position', position);
app.use(uri + 'student', student);
app.use(uri + 'imss', imss);

module.exports = app;
