const handler = require('../../utils/handler');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
const status = require('http-status');
const superagent = require('superagent');

var https = require('https');

let _user;
let _student;
let _employee;
let _role;
let _career;
let _english;

const getAll = (req, res) => {
    _user.find({})
        .select({ 'password': 0 })
        .exec(handler.handleMany.bind(null, 'users', res));
};

const getSecretaries = async (req, res) => {
    const idRole = await getRoleId('Secretaria escolares');

    if (idRole) {
        _user.find({ idRole: idRole }, { password: 0, idRole: 0, email: 0, role: 0 })
            .populate({
                path: 'employeeId', model: 'Employee',
                select: {
                    name: 1, _id: 0
                }
            }).populate({
                path: 'careers.careerId', model: 'Career',
                select: {
                    fullName: 1, shortName: 1, acronym: 1
                }
            }).then(
                users => {
                    if (users) {
                        res.status(status.OK).json({ users: users });
                    } else {
                        res.status(status.NOT_FOUND).json({ msg: "Not found" });
                    }
                }
            );
    }

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
            path: 'employeeId', model: 'Employee',
            select: {
                name: 1, _id: 0
            }
        })
        .exec(async (err, user) => {
            if (err) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                });
            }
            if (user) {
                console.log("exist user");
                user.validatePasswd(password, user.password, invalid => {
                    // Password inválido
                    console.log("inva", invalid);
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
                    console.log("oko")
                    //Se retorna el usuario y token
                    return res.json({
                        user: formatUser,
                        token: token,
                        action: 'signin'
                    });
                });
            } else {
                // Validar si es alumno y su nc y NIP son válidos
                const resApi = await getStudentData(email,password);                
                
                if(resApi){
                    let queryNc = { controlNumber: email };
                    // Buscamos sus datos en la BD local
                    _student.findOne(queryNc)
                        .populate({
                            path: 'idRole', model: 'Role',
                            select: {
                                permissions: 1, name: 1, _id: 0
                            }
                        }).exec(async (error, oneUser) => {
                            // Hubo un error en la consulta
                            if (error) {
                                return res.status(status.NOT_FOUND).json({
                                    error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                });
                            } else {
                                // Se verifica si tiene aprobado el inglés                                        
                                // Se verifica si es egresado
                                let isGraduate = resApi.estatus.toUpperCase() === 'EGR';
                                // Si fue encontrado
                                if (oneUser) {
                                    // Quitar permiso para acceder a la credencial
                                    // if (isGraduate) {
                                    //     oneUser.idRole.permissions = oneUser.idRole.permissions.filter(x => x.routerLink !== 'oneStudentPage');
                                    // }
                                    // Se verifica si tiene aprobado el inglés
                                    let englishApproved = await validateEnglishApproved(email);
                                    console.log('1');
                                    // verificar si se cambio de semestre
                                    if(resApi.semester > oneUser.semester){
                                        _student.updateOne(queryNc,{
                                            $set: { semester: resApi.semester }
                                        }).then(ok=>{});
                                    }
                                     // Se contruye el token
                                     const token = jwt.sign({ email: oneUser.controlNumber }, config.secret);
                                     let formatUser = {
                                         _id: oneUser._id,
                                         name: {
                                             firstName: oneUser.firstName,
                                             lastName: `${oneUser.fatherLastName} ${oneUser.motherLastName}`,
                                             fullName: oneUser.fullName
                                         },
                                         email: oneUser.controlNumber,
                                         career: oneUser.career,
                                         rol: {
                                             name: oneUser.idRole.name,
                                             permissions: oneUser.idRole.permissions
                                         },
                                         english: englishApproved,
                                         graduate: isGraduate,
                                         semester: resApi.semester
                                     };
                                     // Se retorna el usuario y token
                                     return res.json({
                                         user: formatUser,
                                         token: token,
                                         action: 'signin'
                                     });
                                } else {
                                    // No se encontró el registro en la base de datos local buscar en el sii                      
                                    _student.create(resApi)
                                        .then(created => {
                                            console.log('Estudiant creado');
                                            _student.findOne({ _id: created._id })
                                                .populate({
                                                    path: 'idRole', model: 'Role',
                                                    select: {
                                                        permissions: 1, name: 1, _id: 0
                                                    }
                                                })
                                                .exec(async (err, user) => {
                                                    // Se verifica si tiene aprobado el inglés
                                                    let englishApproved = await validateEnglishApproved(email);
                                                    // Quitar permiso para acceder a la credencial
                                                    // if (isGraduate) {
                                                    //     user.idRole.permissions = user.idRole.permissions.filter(x => x.routerLink !== 'oneStudentPage');
                                                    // }
                                                    // Se contruye el token
                                                    const token = jwt.sign({ email: user.controlNumber }, config.secret);
                                                    let formatUser = {
                                                        _id: user._id,
                                                        name: {
                                                            firstName: user.firstName,
                                                            lastName: `${user.fatherLastName} ${user.motherLastName}`,
                                                            fullName: user.fullName
                                                        },
                                                        email: user.controlNumber,
                                                        career: user.career,
                                                        rol: {
                                                            name: user.idRole.name,
                                                            permissions: user.idRole.permissions
                                                        },
                                                        english: englishApproved,
                                                        graduate: isGraduate,
                                                        semester: user.semester
                                                    };
                                                    // Se retorna el usuario y token
                                                    return res.json({
                                                        user: formatUser,
                                                        token: token,
                                                        action: 'signin'
                                                    });
                                                });
                                        }).catch(err => {
                                            console.log(err);
                                            return res.status(status.NOT_FOUND).json({
                                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                            });
                                        });
                                }
                            }
                        });

                }else{
                    return res.status(status.NOT_FOUND).json({
                        error: 'Usuario y/o contraseña incorrectos'
                    });
                }
            }
        });
};

const getStudentData = (email, password) => {
    const options = {
        "rejectUnauthorized": false,
        host: 'wsescolares.tepic.tecnm.mx',
        port: 443,
        path: `/alumnos/info/${email}`,
        // authentication headers     
        headers: {
            'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64')
        }
    };
    const dataStudent = JSON.stringify({
        nc: email,
        nip: password
    });
    var optionsPost = {
        "rejectUnauthorized": false,
        host: 'wsescolares.tepic.tecnm.mx',
        port: 443,
        path: `/alumnos/login`,
        // authentication headers     
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64'),
            'Content-Type': 'application/json',
            'Content-Length': dataStudent.length
        }

    };
    return new Promise(async (resolve) => {
        var studentNew = "";

        https.get(options, function (apiInfo) {

            apiInfo.on('data', function (data) {
                studentNew += data;
            });
            apiInfo.on('end', () => {
                //json con los datos del alumno
                studentNew = JSON.parse(studentNew);
                studentNew.firstName = studentNew.firstname;
                studentNew.fatherLastName = studentNew.fatherlastname;
                studentNew.motherLastName = studentNew.motherlastname;
                studentNew.birthPlace = studentNew.birthplace;
                studentNew.dateBirth = studentNew.datebirth;
                studentNew.civilStatus = studentNew.civilstatus;
                studentNew.originSchool = studentNew.originschool;
                studentNew.nameOriginSchool = studentNew.nameoriginschool;
                studentNew.fullName = `${studentNew.firstName} ${studentNew.fatherLastName} ${studentNew.motherLastName}`;
                studentNew.nip = password;
                studentNew.controlNumber = email;
                if (studentNew.semester == 1) {
                    studentNew.stepWizard = 0;
                }
                const request = https.request(optionsPost, (apiLogin) => {
                    var careerN = "";
                    apiLogin.on('data', async (d) => {
                        careerN += d;


                    });
                    apiLogin.on('end', async () => {
                        careerN = JSON.parse(careerN);

                        switch (careerN.carrera) {
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
                        // Obtener id del rol para estudiente
                        studentNew.estatus = careerN.estatus;
                        const studentId = await getRoleId('Estudiante');
                        studentNew.idRole = studentId;
                        studentNew.careerId = await getCareerId(studentNew.career);

                        resolve(studentNew);

                    });
                });
                request.on('error', (error) => {
                    resolve(false);
                });

                request.write(dataStudent);
                request.end();


            });
            apiInfo.on('error', function (e) {
                resolve(false);
            });
        });
    });
};

const updateFullName = (req, res) => {
    const { nc } = req.params;
    const options = {
        "rejectUnauthorized": false,
        host: 'wsescolares.tepic.tecnm.mx',
        port: 443,
        path: `/alumnos/info/${nc}`,
        // authentication headers     
        headers: {
            'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64')
        }
    };

    var studentNew = "";
    https.get(options, function (apiInfo) {

        apiInfo.on('data', function (data) {
            studentNew += data;
        });
        apiInfo.on('end', () => {
            //json con los datos del alumno
            studentNew = JSON.parse(studentNew);
            studentNew.firstName = studentNew.firstname;
            studentNew.fatherLastName = studentNew.fatherlastname;
            studentNew.motherLastName = studentNew.motherlastname;
            studentNew.birthPlace = studentNew.birthplace;
            studentNew.dateBirth = studentNew.datebirth;
            studentNew.civilStatus = studentNew.civilstatus;
            studentNew.originSchool = studentNew.originschool;
            studentNew.nameOriginSchool = studentNew.nameoriginschool;
            studentNew.fullName = `${studentNew.firstName} ${studentNew.fatherLastName} ${studentNew.motherLastName}`;

            _student.updateOne({ controlNumber: nc }, {$set:studentNew}, { new: true }).then(
                stu => {
                    if (stu) res.status(status.OK).json({ 'action': 'update fullname', stu });
                    else res.status(status.BAD_REQUEST).json({ 'err': 'student not found' })
                }
            ).catch(err => res.status(status.BAD_REQUEST).json({ err: err }));


        });
        apiInfo.on('error', function (e) {
            return res.status(status.NOT_FOUND).json({
                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta4'
            });
        });
    });
};

const getDataEmployee = (req, res) => {
    const { email } = req.params;
    const query = { email: email };

    _user.findOne(query)
        .populate({
            path: 'employeeId', model: 'Employee',
            select: {
                grade: 0, birthdate: 0, gender: 0, curp: 0
            },
            populate: {
                path: 'positions.position', model: 'Position',
                select: '-documents',
                populate: {
                    path: 'ascription', model: 'Department',
                    populate: { path: 'careers', model: 'Career' }
                }
            }
        })
        .exec((err, user) => {
            if (!err && user) {
                const employeeData = user.employeeId.toObject();
                const activePositions = employeeData.positions
                    .filter(({ status }) => status === 'ACTIVE')
                    .map(({ position }) => position);
                employeeData.positions = activePositions.slice();
                res.status(status.OK).json({
                    employee: employeeData
                });
            } else {
                res.status(status.NOT_FOUND).json({
                    status: status.NOT_FOUND,
                    error: err ? err.toString() : 'No lo encontró'
                });
            }
        });
};

const updateUserData = (req, res) => {
    const { _id } = req.params;
    const { employee, user } = req.body;
    const query = { _id: _id };

    new Promise((resolve, reject) => {
        _user.findOne(query, async (err, userData) => {
            if (!err && userData) {
                userData.validatePasswd(user.oldPassword, userData.password, async invalid => {
                    if (!invalid) {
                        const changedPassword = user.newPassword ? await changePassword(userData) : false;
                        const changedEmployee = employee ? await changeEmployee(userData.employeeId) : false;
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
                await _user.updateOne({ _id: userData._id }, {
                    $set: { password: pass }
                }, (err, _) => {
                    resolve(!err);
                });
            } else {
                resolve(false);
            }
        });
    });

    const changeEmployee = (employeeId) => new Promise((resolve) => {
        if (employee.name) {
            _employee.updateOne({ _id: employeeId }, {
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
};

const updateCareersUser = (req, res) => {
    const careerId = req.body.careerId;
    const { action, _id } = req.params;
    console.log(req.body);

    console.log(careerId, action, _id);
    if (careerId) {

        const query = { _id: _id };
        if (action === 'insert') {
            _user.findOneAndUpdate(query, { '$push': { careers: { careerId } } })
                .then(
                    user => {
                        if (user) {
                            res.status(status.OK).json({ msg: 'updated' });
                        } else {
                            res.status(status.NOT_FOUND).json({ err: 'not found' });
                        }
                    }
                ).catch(
                    err => {
                        console.log(err);

                        res.status(status.NOT_FOUND).json({ err: 'not found' });
                    }
                );
        } else if (action === 'delete') {
            _user.findOneAndUpdate(query, { '$pull': { careers: { careerId } } })
                .exec(handler.handleOne.bind(null, 'user', res));
        }
    } else {
        res.status(status.NOT_FOUND).json({ err: 'not found' });
    }
};

const validateEnglishApproved = (controlNumber) => {
    return new Promise((resolve) => {
        const query = {
            controlNumber: controlNumber,
            documents: {
                $elemMatch: {
                    type: 'Ingles'
                }
            }
        };
        _student
            .findOne(query)
            .then(student => {
                if (student) {
                    resolve(true);
                }
                _english
                    .findOne({ controlNumber: controlNumber })
                    .then(data => {
                        if (data) {
                            const doc = {
                                releaseDate: data.releaseDate,
                                type: 'Ingles',
                                status: [
                                    {
                                        name: 'ACTIVO',
                                        active: true,
                                        message: 'Inglés liberado',
                                        date: data.releaseDate,
                                    }
                                ]
                            };
                            _student
                                .updateOne({ controlNumber: data.controlNumber }, { $addToSet: { documents: doc } })
                                .then(updated => {
                                    if (updated.nModified) {
                                        _english.deleteOne({ _id: data._id })
                                            .then(deleted => {
                                                if (deleted.deletedCount) {
                                                    resolve(true);
                                                } else {
                                                    resolve(false);
                                                }
                                            })
                                            .catch(_ => resolve(false));
                                    } else {
                                        resolve(false);
                                    }
                                })
                                .catch(_ => resolve(false));
                        } else {
                            resolve(false);
                        }
                    })
                    .catch(_ => resolve(false));
            })
            .catch(_ => resolve(false));
    });
};

const getRoleId = (roleName) => {


    return new Promise(async (resolve) => {
        await _role.findOne({ name: { $regex: new RegExp(`^${roleName}$`) } }, (err, role) => {
            if (!err && role) {
                resolve(role.id);
            }
        });
    });
};

/**
 * START FOR APP MOVILE
 */

const studentLogin = async (req, res) => {
    const { nc, nip } = req.body;
    var studentNew = await getStudentData(nc, nip);
    if(studentNew){        
        
        _student.findOne({ controlNumber: nc }, { documents: 0, idRole: 0, fileName: 0, acceptedTerms: 0, dateAcceptedTerms: 0, stepWizard: 0, inscriptionStatus: 0, __v: 0 ,nip:0})
            .populate({
                path: 'careerId', model: 'Career',
                select: {
                    fullName: 1, shortName: 1, acronym: 1, _id: 1
                }
            }).populate({
                path: 'folderId', model: 'Folder',
                select: {
                    idFolderInDrive: 1
                }
            }).exec(async (error, oneUser) => {
                if (oneUser) {
                    if(studentNew.semester > oneUser.semester){
                        _student.updateOne({controlNumber:nc},{
                            $set: { semester: studentNew.semester }
                        }).then(ok=>{});
                    }
                    const token = jwt.sign({ nc: oneUser.controlNumber }, config.secret);
                    let { fullName, shortName, acronym, _id } = oneUser.careerId;
                    let career = { fullName, shortName, acronym, _id };
                    let user = { student: oneUser, career };
                    // user.student.career = undefined;                    
                    // user.student.nip = undefined;    
                    user.student.careerId = undefined;
                    return res.status(status.OK).json({
                        user: user,
                        token: token,
                        action: 'signin'
                    });
                } else {                    
                    //no se encuentra en la bd
                    _student.create(studentNew)
                        .then(created => {
                            console.log('Estudiant creado');
                            _student.findOne({ controlNumber: nc }, { documents: 0, idRole: 0, fileName: 0, acceptedTerms: 0, dateAcceptedTerms: 0, stepWizard: 0, inscriptionStatus: 0, __v: 0 })
                        .populate({
                            path: 'careerId', model: 'Career',
                            select: {
                                fullName: 1, shortName: 1, acronym: 1, _id: 1
                            }
                        }).populate({
                            path: 'folderId', model: 'Folder',
                            select: {
                                idFolderInDrive: 1
                            }
                        }).exec((err, oneUser) => {
                            // Se contruye el token                                

                            const token = jwt.sign({ email: oneUser.controlNumber }, config.secret);
                            let { fullName, shortName, acronym, _id } = oneUser.careerId;
                            let career = { fullName, shortName, acronym, _id };
                            let user = { student: oneUser, career };
                            user.student.careerId = undefined;
                            user.student.nip = undefined;

                            return res.status(status.OK).json({
                                user,
                                token,
                                action: 'signin'
                            });
                        });
                        }).catch(err => {
                            console.log(err);
                            return res.status(status.NOT_FOUND).json({
                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                            });
                        });                    
                }
            });
    }else {
        return res.status(status.NOT_FOUND).json({
            error: 'No se encuentra registrado en la base de datos de credenciales . Favor de acudir al departamento de Servicios Escolares a darse de alta'
        });
    }
};
const loginMiGraduacion = (req,res)=>{
    const { email, password } = req.body;
    let query = { email: email };
    console.log(query);
    
    _user.findOne(query)
        .exec(async (err, user) => {
            console.log(user);
            
            if (err) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                });
            }
            if (user) {
                console.log("exist user");
                user.validatePasswd(password, user.password, invalid => {
                    // Password inválido
                    console.log("inva", invalid);
                    if (invalid) {
                        return res.status(status.FORBIDDEN).json({
                            error: 'password is invalid'
                        });
                    }
                    // Password válido, se genera el token
                    const token = jwt.sign({ email: user.email }, config.secret);
                    let formatUser = {
                        role: user.role
                    };                    
                    //Se retorna el usuario y token
                    return res.json({
                        user: formatUser,
                        // token: token,
                        action: 'signin'
                    });
                });
            }else{
                return res.status(status.NOT_FOUND).json({
                    error: 'User not found'
                });
            } 
        });
};

// end for app movile

const getCareerId = (careerName) => {


    return new Promise(async (resolve) => {
        await _career.findOne({ fullName: careerName }, (err, career) => {
            if (!err && career) {
                resolve(career.id);
            }
        });
    });
};

module.exports = (User, Student, Employee, Role, Career, English) => {
    _user = User;
    _student = Student;
    _employee = Employee;
    _role = Role;
    _career = Career;
    _english = English;
    return ({
        register,
        login,
        getAll,
        getDataEmployee,
        updateUserData,
        getSecretaries,
        updateCareersUser,
        studentLogin,
        updateFullName,
        loginMiGraduacion
    });
};
