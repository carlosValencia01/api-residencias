const mongoose = require('mongoose');

let documentSchema = mongoose.Schema({
    strategicProcess: { type: String, trim: true },
    key: { type: String, trim: true, uppercase: true },
    operativeProcess: { type: String, trim: true },
    procedure: { type: String, trim: true },
    code: { type: String, trim: true, unique: true, uppercase: true },
    name: { type: String, trim: true }
});

const documentModel = mongoose.model('Document', documentSchema, 'documents');

module.exports = documentModel;