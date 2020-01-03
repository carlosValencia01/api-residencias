const mongoose = require('mongoose');

let folderSchema = new mongoose.Schema({
    name: { type: String },
    idFolderInDrive : {type: String},
    idPeriod:{type: mongoose.Schema.Types.ObjectId, ref: 'Period'},
    type:{type: Number} // clasificacion o tipo de folder 0 => root, 1 => exp inscripciones, 2 => exp acto recep
});

const folderModel = mongoose.model('Folder', folderSchema, 'folders');

module.exports = folderModel;
