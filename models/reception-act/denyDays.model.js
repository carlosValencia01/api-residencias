const mongoose = require('mongoose');

let denyDaysSchema = new mongoose.Schema({
    date: { type: Date }       
});

const denyDaysModel = mongoose.model('DenyDay', denyDaysSchema, 'denydays');

module.exports = denyDaysModel;