const app = require('../server');
const config = require('../_config');
const server = require('http').Server(app);

const fs = require('fs');

try {
    fs.mkdirSync('images');
    console.log('Folder images created');
} catch(err) {
    if (err.code == 'EEXIST') { console.log('Folder images exits'); }
    else {console.log('ERROR: ', err);}
}

try {
    fs.mkdirSync('documents');
    fs.mkdirSync('documents/tmpFile');
    console.log('Folder documents created');
} catch(err) {
    if (err.code == 'EEXIST') { console.log('Folder documents exits'); }
    else {console.log('ERROR: ', err);}
}

const port = normalizePort(process.env.PORT | config.port);

server.listen(port);
console.log(`server is running on port ${port}`);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) { return val; }
    if (port > 0) { return port; }
    return false;
}