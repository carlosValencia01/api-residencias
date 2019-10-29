const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    label: { type: String, uppercase: true, trim: true, required: true },
    icon: { type: String, trim: true, required: true },
    routerLink: { type: String, trim: true }        
});

module.exports = menuItemSchema;