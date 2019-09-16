const mongoose = require('mongoose');
let menuItemSchema =
    new mongoose.Schema({
        label: { type: String, uppercase: true, trim: true, required: true },
        icon: { type: String, trim: true, required: true },
        routerLink: { type: String, trim: true }        
    });

module.exports = menuItemSchema;