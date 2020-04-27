const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    label: { type: String, trim: true, required: true },
    icon: { type: String, trim: true },
    routerLink: { type: String, trim: true },
    category: { type: String, trim: true, default: '' },
});

const permissionModel = mongoose.model('Permission', permissionSchema, 'permissions');

module.exports = permissionModel;