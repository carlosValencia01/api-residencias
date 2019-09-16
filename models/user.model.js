const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        fullName: { type: String }
    },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: Number },
    idRole: { type: mongoose.Schema.Types.ObjectId}
});

userSchema.pre('save', function (next) {
    if (!this.password) {
        next();
    } else {

        bcrypt.genSalt(8, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) {
                    next(new Error(`Something went wrong encrypting user password, please try update again.`));
                } else {
                    this.password = hash;
                    next();
                }
            });
        });
    }
});

userSchema.method('validatePasswd', function (rpass, upass, cb) {
    bcrypt.compare(rpass, upass, function (err, res) {
        if (res) {
            cb(false);
        } else {
            cb(true);
        }
    });
});

const userModel = mongoose.model('User', userSchema, 'users');

module.exports = userModel;