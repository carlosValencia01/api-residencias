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
        //No es un usuario administrativo del sistema
        if (!users.length) {
            //Validar si es alumno y su nc y NIP son válidos
            const req2 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/validarAlumno/${email}/${password}`)
            .timeout({
                response: 5000,  // Wait 5 seconds for the server to start sending,
                deadline: 20000, // but allow 1 minute for the file to finish loading.
            }).then((res1) => {
                respApi = res1.body;
                console.log(respApi);

                //Está registrado en el SII y su NIP y Password son correctos
                if (respApi.data && respApi.data.existe === '1') {
                    const req3 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/alumnoSeleccionMaterias/${email}/${config.period}`);

                    req3.end();

                    //Verificamos que tenga carga activa
                    req3.on('response', (res2) => {
                        respApi2 = res2.body;
                        console.log(respApi2);

                        //Tiene carga activa
                        if (respApi2 && respApi2.error === "FALSE") {
                            console.log("Si tiene materias cargadas");
                            let queryNc = { controlNumber: email };
                            //Buscamos sus datos en la BD local
                            _student.findOne(queryNc, (error, oneUser) => {
                                //Hubo un error en la consulta
                                if (error) {
                                    console.log("Entra aquí");
                                    return res.status(status.NOT_FOUND).json({
                                        error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                    });
                                } else {
                                    //Si fue encontrado
                                    if (oneUser) {
                                        //Se contruye el token
                                        const token = jwt.sign({ email: email }, config.secret);
                                        let formatUser = {
                                            _id: oneUser._id,
                                            name: {
                                                firstName: respApi2.data.nombre_alumno,
                                                lastName: `${respApi2.data.apellido_paterno} ${respApi2.data.apellido_materno}`,
                                                fullName: oneUser.fullName
                                            },
                                            email: email,
                                            role: 2
                                        }
                                        //Se retorna el usuario y token
                                        return res.json({
                                            user: formatUser,
                                            token: token,
                                            action: 'signin'
                                        });
                                    } else {
                                        //No se encontró el registro en la base de datos local

                                        const fatherName = (respApi2.data.apellido_paterno && respApi2.data.apellido_paterno !== " ") ? " " + respApi2.data.apellido_paterno : "";
                                        const motherName = (respApi2.data.apellido_materno && respApi2.data.apellido_materno !== " ") ? " " + respApi2.data.apellido_materno : "";

                                        let studentNew = {
                                            fullName: respApi2.data.nombre_alumno + fatherName + motherName,
                                            controlNumber: respApi2.data.nocontrol,
                                            nip: password,
                                            career: ' '
                                        };

                                        switch (respApi2.data.carrera) {
                                            case 'L01':
                                                studentNew.career = "ARQUITECTURA";
                                                break;
                                            case 'L02':
                                                studentNew.career = "INGENIERÍA CIVIL";
                                                break;
                                            case 'L03':
                                                studentNew.career = "INGENIERÍA ELÉCTRICA";
                                                break;
                                            case 'L04':
                                                studentNew.career = "INGENIERÍA INDUSTRIAL";
                                                break;
                                            case 'L05':
                                                studentNew.career = "INGENIERÍA EN SISTEMAS COMPUTACIONALES";
                                                break;
                                            case 'L06':
                                                studentNew.career = "INGENIERÍA BIOQUÍMICA";
                                                break;
                                            case 'L07':
                                                studentNew.career = "INGENIERÍA QUÍMICA";
                                                break;
                                            case 'L08':
                                                studentNew.career = "LICENCIATURA EN ADMINISTRACIÓN";
                                                break;
                                            case 'L12':
                                                studentNew.career = "INGENIERÍA EN GESTIÓN EMPRESARIAL";
                                                break;
                                            case 'L11':
                                                studentNew.career = "INGENIERÍA MECATRÓNICA";
                                                break;
                                            case 'ITI':
                                                studentNew.career = "INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES";
                                                break;
                                            case 'MTI':
                                                studentNew.career = "MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN";
                                                break;
                                            case 'P01':
                                                studentNew.career = "MAESTRIA EN CIENCIAS DE ALIMENTOS";
                                                break;
                                            case 'DCA':
                                                studentNew.career = "DOCTORADO EN CIENCIAS DE ALIMENTOS";
                                                break;
                                            default:
                                                break;
                                        }

                                        console.log("Estudiante a guardar");
                                        console.log(studentNew);

                                        _student.create(studentNew).then(created => {
                                            console.log("Estudiant creado");
                                            //Se contruye el token
                                            const token = jwt.sign({ email: email }, config.secret);
                                            let formatUser = {
                                                _id: created._id,
                                                name: {
                                                    firstName: created.fullName,
                                                    lastName: created.fullName,
                                                    fullName: created.fullName
                                                },
                                                email: email,
                                                role: 2
                                            }
                                            //Se retorna el usuario y token
                                            return res.json({
                                                user: formatUser,
                                                token: token,
                                                action: 'signin'
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


                } else {  //No existe en API cómo alumno
                    //Verificar si existe como Trabajador
                    console.log("Entró a ver si es trabajador");
                    if (email.length === 13) {
                        let queryRFC = { rfc: email };
                        _employee.findOne(queryRFC, (error, oneUser) => {
                            if (error) {
                                return res.status(status.NOT_FOUND).json({
                                    error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                });
                            } else {
                                //Si fue encontrado
                                if (oneUser) {
                                    //Se contruye el token
                                    console.log(oneUser);
                                    const token = jwt.sign({ email: email }, config.secret);
                                    let formatUser = {
                                        _id: oneUser._id,
                                        name: {
                                            firstName: oneUser.name.firstName,
                                            lastName: oneUser.name.lastName,
                                            fullName: oneUser.name.fullName
                                        },
                                        email: email,
                                        role: 3
                                    }
                                    //Se retorna el usuario y token
                                    return res.json({
                                        user: formatUser,
                                        token: token,
                                        action: 'signin'
                                    });
                                } else {
                                    //No se encontró el registro en la base de datos local
                                    return res.status(status.NOT_FOUND).json({
                                        error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                    });
                                }
                            }
                        });
                    } else {
                        return res.status(status.NOT_FOUND).json({
                            error: 'Número de control o NIP incorrectos'
                        });
                    }
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
        //Si es usuario administrativo del sistema
        else {
            let oneUser = users[0];
            //Convertir y validar password
            oneUser.validatePasswd(password, oneUser.password, invalid => {
                //Password inválido
                if (invalid) {
                    return res.status(status.FORBIDDEN).json({
                        error: 'password is invalid'
                    });
                }

                //Password válido, se genera el token
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

                //Se regresa la respuesta y el token
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