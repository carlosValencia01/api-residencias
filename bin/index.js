const app = require('../server');
const config = require('../_config');
const server = require('http').Server(app);

const port = normalizePort(process.env.PORT | config.port);

server.listen(port);
console.log(`server is running on port ${port}`);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) { return val; }
    if (port > 0) { return port; }
    return false;
}