const mongoose = require('mongoose');

let requestSchema = new mongoose.Schema({
    graduate: {
        name: {
            firstName: {
                type: String,
                required: true,
                uppercase: true,
                trim: true
            },
            lastName: {
                type: String,
                required: true,
                uppercase: true,
                trim: true
            },
            fullName: {
                type: String,
                required: true,
                uppercase: true,
                trim: true
            },
        },
        career: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        controlNumber: {
            type: String,
            unique: true,
            required: true,
            uppercase: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
    },
    request: {
        projectName: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        product: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        numberParticipants: {
            type: Number,
            required: true
        },
        honorificMention: {
            type: Boolean,
            required: true
        },
        proposedDate: {
            type: Date,
            required: true
        },
        projectFile: {
            type: String,
            required: true
        },
    },
    telephoneContact: {
        type: String,
        required: true,
        trim: true
    },
    creationDate: {
        type: Date,
        required: true,
        uppercase: true,
        trim: true
    },
    editionDate: {
        type: Date,
        required: true,
        uppercase: true,
        trim: true
    },
    headProfessionalStudiesDivision: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    degreeCoordinator: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    observations: {
        type: String,
        trim: true
    }
});

const requestModel = mongoose.model('Request', requestSchema, 'requests');

module.exports = requestModel;
