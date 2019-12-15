const mongoose = require('mongoose');

let folderSchema = new mongoose.Schema({
    name: { type: String },
    idFolderInDrive : {type: String},
    idPeriod:{type: mongoose.Schema.Types.ObjectId, ref: 'Period'}
});

const folderModel = mongoose.model('Folder', folderSchema, 'folders');

module.exports = folderModel;
