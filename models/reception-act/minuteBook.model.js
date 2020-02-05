const mongoose = require('mongoose');

let minuteBookSchema = mongoose.Schema({
    name: {type: String, uppercase: true, trim: true},
    number: {type: String, uppercase: true, trim: true},
    registerDate: {type: Date},
    titleOption: {type: String, uppercase: true, trim: true},
    careers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Career'}],
    foja: {type: Number},
    status: {type: Boolean, default: false}
});

const minuteBookModel = mongoose.model('MinuteBook', minuteBookSchema, 'MinuteBooks');

module.exports = minuteBookModel;
