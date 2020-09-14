// la variable globalSocketIo se captura al
// cargar el archivo index.js

// enviar a todos los clientes un evento
/**
* @param {eventName = nombre del evento a emitir} eventName
* @param {data = datos a emitir} data
*/
const broadcastEmit = (eventName, data)=>{
    globalSocketIo.emit(eventName,data);
};

// enviar a un solo cliente un evento
/**
* @param {eventName = nombre del evento a emitir} eventName
* @param {data = datos a emitir} data
* @param {clientId = ID del cliente a quien se va a emitir} clientId
*/
const singleEmit = (eventName, data, clientId)=>{    
    globalSocketIo.to(clientId).emit(eventName,data);
};

module.exports.broadcastEmit = broadcastEmit;
module.exports.singleEmit = singleEmit;