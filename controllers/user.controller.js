const handler = require('../utils/handler');
const jwt = require('jsonwebtoken');
const config = require('../_config');
const status = require('http-status');
const superagent = require('superagent');


let _user;
let _student;
let _employee;

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
            const req2 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/validarAlumno/${email}/${password}`);

            req2.end();

            req2.on('response', (res1) => {

                respApi = res1.body;

                if (respApi.data.existe === '1') {
                    let queryNc = { controlNumber: email };
                    _student.findOne(queryNc, (error, oneUser) => {
                        if (error) {
                            return res.status(status.NOT_FOUND).json({
                                error: 'No se encuentra registrado en la base de datos de credenciales'
                            });
                        } else {
                            if(oneUser) {
                                const token = jwt.sign({ email: email }, config.secret);
                                    let formatUser = {
                                        _id: oneUser._id,
                                        name: {
                                            firstName: oneUser.fullName,
                                            lastName: oneUser.fullName,
                                            fullName: oneUser.fullName
                                        },
                                        email: email,
                                        role: 2
                                    }

                                    return res.json({
                                        user: formatUser,
                                        token: token,
                                        action: 'signin'
                                    });
                            } else {
                                return res.status(status.NOT_FOUND).json({
                                    error: 'No se encuentra registrado en la base de datos de credenciales'
                                });
                            }
                        }
                    });
                } else {
                    return res.status(status.NOT_FOUND).json({
                        error: 'Número de control o NIP incorrectos'
                    });
                }
            });
        }
        else {
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
        }
    });
}

module.exports = (User, Student, Employee) => {
    _user = User;
    _student = Student;
    _employee = Employee;
    return ({
        register,
        login,
        getAll
    });
};