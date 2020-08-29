const mongoose = require('mongoose');

const bossMessageSchema = new mongoose.Schema({

    message: { type: String, trim: true, required: true }, // mensaje para los alumnos con grupo no activo    

});

const bossMessageModel = mongoose.model('EnBossMessage', bossMessageSchema, 'enBossMessages');

module.exports = bossMessageModel;