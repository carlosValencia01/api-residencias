const mongoose = require('mongoose');
const menuSchema = require('./menu.schema');

let rolSchema = new mongoose.Schema({
    name: { type: String, unique: true, uppercase: true, trim: true, minlength: 4, maxlength: 50 },
    description: { type: String, uppercase: true, trim: true, maxlength: 2500 },
    permissions: [
       menuSchema
    ]
});

const roleModel = mongoose.model('Role', rolSchema, 'roles');
module.exports = roleModel;