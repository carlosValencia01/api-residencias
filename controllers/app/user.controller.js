const handler = require('../../utils/handler');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
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

    _user.findOne(query)
        .populate({
            path: 'idRole', model: 'Role',
            select: {
                permissions: 1, name: 1, _id: 0
            }
        })
        .populate({
            path: 'employeeId', model:'Employee',
            select: {
                name: 1, _id: 0
            }
        })
        .exec((err, user) => {
            if (err) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                });
            }
            if (user) {
                console.log(user);
                user.validatePasswd(password, user.password, invalid => {
                    // Password inválido
                    if (invalid) {
                        return res.status(status.FORBIDDEN).json({
                            error: 'password is invalid'
                        });
                    }
                    // Password válido, se genera el token
                    const token = jwt.sign({ email: user.email }, config.secret);
                    let formatUser = {
                        _id: user._id,
                        name: {
                            firstName: user.employeeId.name.firstName,
                            lastName: user.employeeId.name.lastName,
                            fullName: user.employeeId.name.fullName
                        },
                        email: user.email,
                        role: user.role,
                        rol: {
                            name: user.idRole.name,
                            permissions: user.idRole.permissions
                        }
                    };
                    //Se retorna el usuario y token
                    return res.json({
                        user: formatUser,
                        token: token,
                        action: 'signin'
                    });
                });
            } else {
                // Validar si es alumno y su nc y NIP son válidos
                superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/validarAlumno/${email}/${password}`)
                    .timeout({
                        response: 5000,  // Wait 5 seconds for the server to start sending,
                        deadline: 20000, // but allow 1 minute for the file to finish loading.
                    }).then((res1) => {
                        const respApi = res1.body;
                        console.log(respApi);

                        // Está registrado en el SII y su NIP y Password son correctos
                        if (respApi.data && respApi.data.existe === '1') {
                            const req3 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/alumnoSeleccionMaterias/${email}/${config.period}`);
                            req3.end();

                            // Verificamos que tenga carga activa
                            req3.on('response', (res2) => {
                                const respApi2 = res2.body;
                                console.log(respApi2);

                                // Tiene carga activa
                                if (respApi2 && respApi2.error === 'FALSE') {
                                    console.log('Si tiene materias cargadas');
                                    let queryNc = { controlNumber: email };
                                    // Buscamos sus datos en la BD local
                                    _student.findOne(queryNc)
                                        .populate({
                                            path: 'idRole', model: 'Role',
                                            select: {
                                                permissions: 1, name: 1, _id: 0
                                            }
                                        }).exec((error, oneUser) => {
                                            // Hubo un error en la consulta
                                            if (error) {
                                                console.log('Entra aquí');
                                                return res.status(status.NOT_FOUND).json({
                                                    error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                                });
                                            } else {
                                                // Si fue encontrado
                                                if (oneUser) {
                                                    // Se contruye el token
                                                    const token = jwt.sign({ email: oneUser.controlNumber }, config.secret);
                                                    let formatUser = {
                                                        _id: oneUser._id,
                                                        name: {
                                                            firstName: respApi2.data.nombre_alumno,
                                                            lastName: `${respApi2.data.apellido_paterno} ${respApi2.data.apellido_materno}`,
                                                            fullName: oneUser.fullName
                                                        },
                                                        email: oneUser.controlNumber,
                                                        career: oneUser.career,
                                                        rol: {
                                                            name: oneUser.idRole.name,
                                                            permissions: oneUser.idRole.permissions
                                                        }
                                                    };
                                                    // Se retorna el usuario y token
                                                    return res.json({
                                                        user: formatUser,
                                                        token: token,
                                                        action: 'signin'
                                                    });
                                                } else {
                                                    // No se encontró el registro en la base de datos local
                                                    const fatherName = (respApi2.data.apellido_paterno && respApi2.data.apellido_paterno !== ' ') ? ' ' + respApi2.data.apellido_paterno : '';
                                                    const motherName = (respApi2.data.apellido_materno && respApi2.data.apellido_materno !== ' ') ? ' ' + respApi2.data.apellido_materno : '';

                                                    let studentNew = {
                                                        fullName: respApi2.data.nombre_alumno + fatherName + motherName,
                                                        controlNumber: respApi2.data.nocontrol,
                                                        nip: password,
                                                        career: ' ',
                                                        //Rol a estudiante
                                                        idRole: '5ce1982478de152cb608f153'
                                                    };

                                                    switch (respApi2.data.carrera) {
                                                        case 'L01':
                                                            studentNew.career = 'ARQUITECTURA';
                                                            break;
                                                        case 'L02':
                                                            studentNew.career = 'INGENIERÍA CIVIL';
                                                            break;
                                                        case 'L03':
                                                            studentNew.career = 'INGENIERÍA ELÉCTRICA';
                                                            break;
                                                        case 'L04':
                                                            studentNew.career = 'INGENIERÍA INDUSTRIAL';
                                                            break;
                                                        case 'L05':
                                                            studentNew.career = 'INGENIERÍA EN SISTEMAS COMPUTACIONALES';
                                                            break;
                                                        case 'L06':
                                                            studentNew.career = 'INGENIERÍA BIOQUÍMICA';
                                                            break;
                                                        case 'L07':
                                                            studentNew.career = 'INGENIERÍA QUÍMICA';
                                                            break;
                                                        case 'L08':
                                                            studentNew.career = 'LICENCIATURA EN ADMINISTRACIÓN';
                                                            break;
                                                        case 'L12':
                                                            studentNew.career = 'INGENIERÍA EN GESTIÓN EMPRESARIAL';
                                                            break;
                                                        case 'L11':
                                                            studentNew.career = 'INGENIERÍA MECATRÓNICA';
                                                            break;
                                                        case 'ITI':
                                                            studentNew.career = 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES';
                                                            break;
                                                        case 'MTI':
                                                            studentNew.career = 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN';
                                                            break;
                                                        case 'P01':
                                                            studentNew.career = 'MAESTRIA EN CIENCIAS DE ALIMENTOS';
                                                            break;
                                                        case 'DCA':
                                                            studentNew.career = 'DOCTORADO EN CIENCIAS DE ALIMENTOS';
                                                            break;
                                                        default:
                                                            break;
                                                    }

                                                    console.log('Estudiante a guardar');
                                                    console.log(studentNew);

                                                    _student.create(studentNew)
                                                        .then(created => {
                                                            console.log('Estudiant creado');
                                                            _student.findOne({_id: created._id})
                                                                .populate({
                                                                    path: 'idRole', model: 'Role',
                                                                    select: {
                                                                        permissions: 1, name: 1, _id: 0
                                                                    }
                                                                })
                                                                .exec((err, user) => {
                                                                    // Se contruye el token
                                                                    const token = jwt.sign({ email: user.controlNumber }, config.secret);
                                                                    let formatUser = {
                                                                        _id: user._id,
                                                                        name: {
                                                                            firstName: respApi2.data.nombre_alumno,
                                                                            lastName: `${respApi2.data.apellido_paterno} ${respApi2.data.apellido_materno}`,
                                                                            fullName: user.fullName
                                                                        },
                                                                        email: user.controlNumber,
                                                                        career: user.career,
                                                                        rol: {
                                                                            name: user.idRole.name,
                                                                            permissions: user.idRole.permissions
                                                                        }
                                                                    };
                                                                    // Se retorna el usuario y token
                                                                    return res.json({
                                                                        user: formatUser,
                                                                        token: token,
                                                                        action: 'signin'
                                                                    });
                                                                });
                                                        }).catch(err => {
                                                            return res.status(status.NOT_FOUND).json({
                                                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                                            });
                                                        });
                                                }
                                            }
                                        });
                                } else {
                                    return res.status(status.UNAUTHORIZED).json({
                                        error: 'No puede ingresar debido a que no es alumno del periodo actual (No tiene materias cargadas)'
                                    });
                                }
                            });
                        }
                    }, err => {
                        if(err.timeout) {
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                error: 'No se pudo conectar al SII, intente más tarde'
                            });
                        } else {
                            return res.status(status.INTERNAL_SERVER_ERROR).json({
                                error: 'No se pudo conectar al SII, intente más tarde'
                            });
                        }
                    });
            }
    });
};

const getDataEmployee = (req, res) => {
    const { email } = req.params;
    const query = { email: email };

    _user.findOne(query)
        .populate({
            path: 'employeeId', model: 'Employee',
            select: {
                rfc: 1, name: 1, area: 1, position: 1, _id: 1
            }
        })
        .exec((err, employee) => {
            if (!err && employee) {
                const employeeData = {
                    _id: employee.employeeId._id,
                    rfc: employee.employeeId.rfc,
                    email: employee.email,
                    name: employee.employeeId.name,
                    area: employee.employeeId.area,
                    position: employee.employeeId.position
                };
                res.json({
                    employee: employeeData
                });
            } else {
                res.json({
                    status: status.NOT_FOUND,
                    error: err.toString()
                });
            }
        });
};

const updateUserData = (req, res) => {
    const { _id } = req.params;
    const { employee, user } = req.body;
    const query = { _id: _id };

    new Promise((resolve, reject) => {
        _user.findOne({ employeeId: _id }, async (err, userData) => {
            if (!err && userData) {
                userData.validatePasswd(user.oldPassword, userData.password, async invalid => {
                    if (!invalid) {
                        const changedPassword = user.newPassword ? await changePassword(userData) : false;
                        const changedEmployee = employee ? await changeEmployee() : false;
                        resolve({
                            password: changedPassword,
                            employee: changedEmployee
                        });
                    } else {
                        resolve(false);
                    }
                });
            } else {
                reject();
            }
        });
    })
    .then(data => {
        if (!data) {
            return res.json({
                status: status.INTERNAL_SERVER_ERROR,
                message: 'Contraseña incorrecta'
            });
        }
        return res.json({
            password: data.password,
            employee: data.employee
        });
    })
    .catch(_ => {
        return res.json({
            status: status.NOT_FOUND,
            password: false,
            employee: false
        });
    });

    const changePassword = (userData) => new Promise((resolve) => {
        userData.encrypt(user.newPassword, async (pass) => {
            if (pass) {
                await _user.updateOne({ employeeId: _id }, {
                    $set: { password: pass }}, (err, _) => {
                        resolve(!err);
                    });
            } else {
                resolve(false);
            }
        });
    });

    const changeEmployee = () => new Promise((resolve) => {
        if (employee.name) {
             _employee.updateOne(query, {
                $set: {
                    name: employee.name
                }
            }, (err, _) => {
                resolve(!err);
            });
        } else {
            resolve(false);
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
        getAll,
        getDataEmployee,
        updateUserData,
    });
};
