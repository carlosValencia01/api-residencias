const mongoose = require('mongoose');
//const menuItemSchema = require('./itemMenu.schema');
let menuSchema = new mongoose.Schema({
    label: { type: String, uppercase: true, trim: true, required: true },
    icon: { type: String, trim: true, required: true },
    routerLink: { type: String, trim: true }    
});

menuSchema.add({items:[menuSchema]})


module.exports = menuSchema;
