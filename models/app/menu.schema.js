const mongoose = require('mongoose');

let menuSchema = new mongoose.Schema({
    label: { type: String, uppercase: true, trim: true, required: true },
    icon: { type: String, trim: true, required: true },
    routerLink: { type: String, trim: true }    
});

menuSchema.add({ items: [menuSchema] });

module.exports = menuSchema;
