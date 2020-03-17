const mongoose = require('mongoose');

let companySchema = new mongoose.Schema({
    rfc: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String },
    legalRepresentative: { type: String },
    extension: { type: String },
    phone: { type: String },
    address: [
        { country: { type: String } },
        { state: { type: String } },
        { colony: { type: String } },
        { city: { type: String } },
        { street: { type: String} },
        { noInt: { type: String} },
        { noExt: { type: String} }
    ],
    contactName: { type: String },
    webPage: { type: String },
    socialMedia: [{
        facebook: { type: String},
        instagram: { type: String },
        twitter: { type: String }
    }],
    description: { type: String },
    folderId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    documents:[
    {
        filename: { type: String },
        releaseDate: { type: Date, default: new Date() },
        type: { type: String },
        fileIdInDrive:{ type: String },
        status:[
            {
                name: { type: String },
                message:{ type: String },
                date:{ type: Date, default: new Date() },
                observation:{ type: String }
            }
        ]
    }],
    verificationStatus: { type: Boolean},
    verificationCode: { type: Number },
    sentVerificationCode: { type: Boolean }
});

const companyModel = mongoose.model('Company', companySchema, 'companies');

module.exports = companyModel;