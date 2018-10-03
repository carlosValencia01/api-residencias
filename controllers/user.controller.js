const handler = require('../utils/handler');
const jwt = require('jsonwebtoken');
const config = require('../_config');
const status = require('http-status');

let _user;

const getAll = (req, res) => {
    _user.find({})
        .select({ 'password': 0 })
        .exec(handler.handleMany.bind(null, 'users', res));
};

const register = (req, res) => {
    const newUser = req.body;

    const token = jwt.sign({ email: newUser.email }, config.secret);

    _user.create(newUser).then(created => {

        res.json({
            user: created,
            token: token,
            action: 'register'
        });

    }).catch(err =>
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        }));
};

const login = (req, res) => {
    const { email, password } = req.body;

    let query = { email: email };

    _user.find(query).exec((err, users) => {
        if (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                error: err.toString()
            });
        }
        if (!users.length) {
            return res.status(status.NOT_FOUND).json({
                error: 'user not found'
            });
        }

        let oneUser = users[0];

        oneUser.validatePasswd(password, oneUser.password, invalid => {
            if (invalid) {
                return res.status(status.FORBIDDEN).json({
                    error: 'password is invalid'
                });
            }

            const token = jwt.sign({ email: email }, config.secret);

            let formatUser = {
                _id: oneUser._id,
                name: {
                    firstName: oneUser.name.firstName,
                    lastName: oneUser.name.lastName,
                    fullName: oneUser.name.fullName
                },
                email: oneUser.email,
                role: oneUser.role,
            }

            console.log(token);

            res.json({
                user: formatUser,
                token: token,
                action: 'signin'
            });
        });
    });
}

module.exports = (User) => {
    _user = User;
    return ({
        register,
        login,
        getAll
    });
};