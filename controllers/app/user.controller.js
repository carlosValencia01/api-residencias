const handler = require('../../utils/handler');
const jwt = require('jsonwebtoken');
const config = require('../../_config');
const status = require('http-status');
const https = require('https');
const eCareers = require('../../enumerators/shared/careers.enum');

let _user;
let _student;
let _employee;
let _role;
let _career;
let _english;
let _imss;

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

const login = async (req, res) => {
    let { email, password } = req.body;
    email = (email || '').toString().trim();

    if (!email || !(password || '').trim()) {
        return res.status(status.NOT_FOUND).json({
            error: 'Usuario y/o contraseña son incorrectos'
        });
    }

    if (/.@./.test(email)) {
        const query = { email: email };
        if (/.@ittepic.edu.mx$/.test(email)) {
            const user = await _findUser(query);
            if (user) {
                user.validatePasswd(password, user.password, (invalid) => {
                    // Password inválido
                    if (invalid) {
                        return res.status(status.FORBIDDEN).json({
                            error: 'Usuario y/o contraseña incorrectos'
                        });
                    }
                    // Password válido, se genera el token
                    const token = jwt.sign({ email: user.email }, config.secret);
                    const role = user.idRole
                        ? {
                            name: user.idRole.name,
                            permissions: user.idRole.permissions
                        }
                        : null
                    let formatUser = {
                        _id: user._id,
                        name: {
                            firstName: user.employeeId.name.firstName,
                            lastName: user.employeeId.name.lastName,
                            fullName: user.employeeId.name.fullName
                        },
                        email: user.email,
                        role: user.role,
                        rol: role
                    };
                    //Se retorna el usuario y token
                    return res.json({
                        user: formatUser,
                        token: token,
                        action: 'signin'
                    });
                });
            } else {
                return res.status(status.NOT_FOUND).json({
                    error: 'Usuario y/o contraseña incorrectos'
                });
            }
        } else {
            const company = await _findCompany(query);
            if (company) {
                company.validatePasswd(password, company.password, (invalid) => {
                    // Password inválido
                    if (invalid) {
                        return res.status(status.FORBIDDEN).json({
                            error: 'Usuario y/o contraseña incorrectos'
                        });
                    }
                    // Password válido, se genera el token
                    const token = jwt.sign({ email: company.email }, config.secret);
                    let formatUser = {
                        _id: company._id,
                        companyName: company.companyId.companyName,
                        email: company.email,
                        role: company.role,
                        rol: {
                            name: company.idRole.name,
                            permissions: company.idRole.permissions
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
                return res.status(status.NOT_FOUND).json({
                    error: 'Usuario y/o contraseña incorrectos'
                });
            }
        }
    } else if (/^[A-Za-z]{0,1}[0-9]{8,9}$/.test(email)) {
        const controlNumber = email;
        const nip = (password || '').trim();
        // Validar si es alumno y su nc y NIP son válidos
        const studentData = await getStudentData(controlNumber, nip);
        let query = { controlNumber: controlNumber };
        if (studentData) {
            // Buscar estudiante en la bd local
            let student = await _findStudent(query);
            if (student) {
                student = student.toObject();
                // Se verifica si tiene aprobado el inglés
                await validateEnglishApproved(controlNumber);
                // Se verifica si está asegurado en el imss
                await validateInsuredStudent(controlNumber);
                // verificar si se cambió de semestre
                if (studentData.semester > student.semester) {
                    _student.updateOne(query, {
                        $set: { semester: studentData.semester }
                    }).then(ok => { });
                }
                // Verficar estatus
                if (!student.hasOwnProperty('status')) {
                    _student.updateOne(query, { $set: { status: studentData.status.toUpperCase() } }).then(ok => { });
                } else if (student.status !== studentData.status) {
                    _student.updateOne(query, { $set: { status: studentData.status.toUpperCase() } }).then(ok => { });
                }
                // Verifica si existe cambio en el porcentaje reticular o creditos aprobados
                if (!student.hasOwnProperty('creditsCareer')) {
                    _student.updateOne(query, { $set: { creditsCareer: parseInt(studentData.creditsCareer) } }).then(ok => { });
                } else if (student.creditsCareer < parseInt(studentData.creditsCareer) ) {
                    _student.updateOne(query, { $set: { creditsCareer: parseInt(studentData.creditsCareer) } }).then(ok => { });
                }
                if (!student.hasOwnProperty('percentCareer')) {
                    _student.updateOne(query, { $set: { percentCareer: parseFloat(studentData.percentCareer) } }).then(ok => { });
                } else if (student.percentCareer < parseFloat(studentData.percentCareer)) {
                    _student.updateOne(query, { $set: { percentCareer: parseFloat(studentData.percentCareer) } }).then(ok => { });
                }
                // Se contruye el token
                const token = jwt.sign({ email: student.controlNumber }, config.secret);
                let formatUser = {
                    _id: student._id,
                    name: {
                        firstName: student.firstName,
                        lastName: `${student.fatherLastName} ${student.motherLastName}`,
                        fullName: student.fullName
                    },
                    email: student.controlNumber,
                    career: student.career,
                    rol: {
                        name: student.idRole.name,
                        permissions: student.idRole.permissions
                    },
                    semester: studentData.semester,
                    creditsCareer: studentData.creditsCareer,
                    percentCareer: studentData.percentCareer,
                    status: student.status
                };
                return res.json({
                    user: formatUser,
                    gender: student.sex,
                    token: token,
                    action: 'signin'
                });
            } else {
                const isCreated = await _createStudent(studentData);
                if (isCreated) {
                    const student = await _findStudent(query);
                    if (student) {
                        // Se verifica si tiene aprobado el inglés
                        await validateEnglishApproved(controlNumber);
                        // Se verifica si está asegurado en el imss
                        await validateInsuredStudent(controlNumber);
                        const token = jwt.sign({ email: student.controlNumber }, config.secret);
                        let formatUser = {
                            _id: student._id,
                            name: {
                                firstName: student.firstName,
                                lastName: `${student.fatherLastName} ${student.motherLastName}`,
                                fullName: student.fullName
                            },
                            email: student.controlNumber,
                            career: student.careerId.acronym,
                            rol: {
                                name: student.idRole.name,
                                permissions: student.idRole.permissions
                            },
                            semester: student.semester,
                            creditsCareer: student.creditsCareer,
                            percentCareer: student.percentCareer,
                        };
                        return res.json({
                            user: formatUser,
                            gender: student.sex,
                            token: token,
                            action: 'signin'
                        });
                    } else {
                        return res.status(status.NOT_FOUND).json({
                            error: 'Usuario y/o contraseña son incorrectos'
                        });
                    }
                } else {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({
                        error: 'Ocurrió un error, intente de nuevo'
                    });
                }
            }
        } else {
            return res.status(status.NOT_FOUND).json({
                error: 'Usuario y/o contraseña son incorrectos'
            });
        }
    } else if (/^[A-Za-z]{3}[0-9]{8}$/.test(email)) {
        const controlNumber = email;
        const nip = (password || '').trim();
        let query = { controlNumber };
        // Buscar estudiante en la bd local
        let student = await _findStudent(query);
        if (student) {
            student = student.toObject();
            // Verificar si el estudiante tiene nip en la bd local
            if (!student.hasOwnProperty('nip')) {
                return res.status(status.NOT_FOUND)
                    .json({
                        error: 'Usuario no cuenta con nip asignado'
                    });
            }
            // Validar si el NIP es correcto
            if (student.nip !== nip) {
                return res.status(status.NOT_FOUND)
                    .json({
                        error: 'Usuario y/o contraseña son incorrectos'
                    });
            }
            // Se verifica si tiene aprobado el inglés
            await validateEnglishApproved(controlNumber);
            // Se contruye el token
            const token = jwt.sign({ email: student.controlNumber }, config.secret);
            let formatUser = {
                _id: student._id,
                name: {
                    firstName: student.firstName,
                    lastName: `${student.fatherLastName} ${student.motherLastName}`,
                    fullName: student.fullName
                },
                email: student.controlNumber,
                career: student.career,
                rol: {
                    name: student.idRole.name,
                    permissions: student.idRole.permissions
                },
                semester: student.semester
            };
            return res.json({
                user: formatUser,
                gender: student.sex,
                token: token,
                action: 'signin'
            });
        } else {
            return res.status(status.NOT_FOUND).json({
                error: 'Usuario y/o contraseña incorrectos'
            });
        }
    } else {
        return res.status(status.NOT_FOUND).json({
            error: 'Usuario y/o contraseña incorrectos'
        });
    }
}

const getStatusDegree = (req, res) => {
    const { _id } = req.params;

    _student.findOne({ _id: _id }).then(async (data) => {
        if (data) {
            const student = data.toObject();
            const hasEnglish = !!student.documents.filter(doc => doc.type === 'Ingles')[0];
            const studentSii = (await getStudentBySii(student.controlNumber)).data;
            if (!student.hasOwnProperty('status') || student.status !== studentSii.status) {
                _student.updateOne({ _id: student._id }, { $set: { status: studentSii.status } })
                    .then(_ => res.status(status.OK).json({
                        status: studentSii.status,
                        english: hasEnglish
                    }))
                    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({
                        error: 'Error al actualizar status'
                    }));
            } else {
                res.status(status.OK).json({
                    status: student.status,
                    english: hasEnglish
                });
            }
        } else {
            res.status(status.NOT_FOUND).json({
                error: 'No se encontró el estudiante'
            });
        }
    }).catch(_ => res.status(status.NOT_FOUND).json({
        error: 'Estudiante no encontrado'
    }));

};

const getStudentData = (controlNumber, password) => {
    controlNumber = (controlNumber || '').toString().trim();

    return new Promise(async (resolve) => {
        const login = await _loginSii(controlNumber, password);
        if (login) {
            const studentData = await _getStudentSii(controlNumber);
            if (studentData) {
                return resolve(studentData);
            }
            return resolve(false);
        }
        return resolve(false);
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

            _student.updateOne({ controlNumber: nc }, { $set: studentNew }, { new: true }).then(
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
                grade: 0, birthdate: 0, curp: 0
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
        .exec(async (err, user) => {
            if (!err && user) {
                const employeeData = user.employeeId.toObject();
                const activePositions = employeeData.positions
                    .filter(({ status }) => status === 'ACTIVE');
                let _positions = [];
                for (const item of activePositions) {
                    const _position = item.position;
                    if (_position && _position.role) {
                        _position.role = await _getRoleById(_position.role);
                    }
                    _positions.push(_position);
                }
                employeeData.positions = _positions.slice();
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

const validateInsuredStudent = (controlNumber) => {
    return new Promise((resolve) => {
        const query = {
            controlNumber: controlNumber,
            documents: {
                $elemMatch: {
                    type: 'IMSS'
                }
            }
        };
        _student
            .findOne(query)
            .then(student => {
                if (student) {
                    resolve(true);
                }
                _imss
                    .findOne({ controlNumber: controlNumber })
                    .then(data => {
                        console.log(controlNumber);
                        if (data) {
                            console.log(data);
                            const doc = {
                                registerDate: data.registerDate,
                                type: 'IMSS',
                                status: [
                                    {
                                        name: 'ACTIVO',
                                        active: true,
                                        message: 'Alumno Asegurado',
                                        date: data.registerDate
                                    }
                                ]
                            };
                            _student
                                .updateOne({ controlNumber: data.controlNumber }, { $addToSet: { documents: doc } })
                                .then(updated => {
                                    if (updated.nModified) {
                                        _imss.deleteOne({ _id: data._id })
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
    return new Promise((resolve) => {
        _role.findOne({ name: { $regex: new RegExp(`^${roleName}$`) } })
            .then((role) => {
                if (role) {
                    resolve(role.id);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(null);
            });
    });
};

/**
 * START FOR APP MOVILE
 */

const studentLogin = async (req, res) => {
    const { nc, nip } = req.body;
    var studentNew = await getStudentData(nc, nip);
    if (studentNew) {

        _student.findOne({ controlNumber: nc }, { documents: 0, idRole: 0, fileName: 0, acceptedTerms: 0, dateAcceptedTerms: 0, stepWizard: 0, inscriptionStatus: 0, __v: 0, nip: 0 })
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
                    if (studentNew.semester > oneUser.semester) {
                        _student.updateOne({ controlNumber: nc }, {
                            $set: { semester: studentNew.semester }
                        }).then(ok => { });
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
                            // console.log('Estudiant creado',created);
                            // console.log(nc);

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
    } else {
        return res.status(status.NOT_FOUND).json({
            error: 'No se encuentra registrado en la base de datos de credenciales . Favor de acudir al departamento de Servicios Escolares a darse de alta'
        });
    }
};

const loginMiGraduacion = (req, res) => {
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
            } else {
                return res.status(status.NOT_FOUND).json({
                    error: 'User not found'
                });
            }
        });
};
// end for app movile

const getCareerId = (careerName) => {
    console.log(careerName);
    return new Promise((resolve) => {
        _career.findOne({ fullName: careerName })
            .then((career) => {
                if (career) {
                    resolve(career.id);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(null);
            });
    });
};

const getStudentBySii = (controlNumber) => {
    return new Promise(async (resolve) => {
        const studentData = await _getStudentSii(controlNumber);
        if (studentData) {
            return resolve({ response: true, data: studentData });
        }
        resolve({ response: false, data: null });
    });

};

const titledRegister = async (req, res) => {
    const data = req.body;
    const result = await getStudentBySii(data.controlNumber);

    if (result.response) {
        const StudentGet = result.data;
        let queryNc = { controlNumber: data.controlNumber };
        // Buscamos sus datos en la BD local
        _student.findOne(queryNc).exec(async (error, student) => {
            // Hubo un error en la consulta
            if (error) {
                return res.status(status.NOT_FOUND).json({
                    error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                });
            } else {
                let isGraduate = (StudentGet.status || '').toUpperCase() === 'EGR';
                const isTitled = (StudentGet.status || '').toUpperCase() === 'TIT';
                // Si fue encontrado
                if (student) {
                    let englishApproved = await validateEnglishApproved(data.controlNumber);
                    // verificar si se cambio de semestre
                    if (StudentGet.semester > student.semester) {
                        _student.updateOne(queryNc, {
                            $set: { semester: StudentGet.semester }
                        }).then(ok => { });
                    }
                    let formatUser = {
                        _id: student._id,
                        fullName: student.fullName,
                        career: student.career,
                        controlNumber: student.controlNumber,
                        isGraduate: isGraduate,
                        englishApproved: englishApproved,
                        titled: isTitled
                    };
                    return res.json(
                        formatUser
                    );
                } else {
                    // No se encontró el registro en la base de datos local buscar en el sii                      
                    _student.create(StudentGet)
                        .then(async (created) => {
                            // console.log("CREATED", created);
                            let englishApproved = await validateEnglishApproved(data.controlNumber);
                            let formatUser = {
                                _id: created._id,
                                fullName: created.fullName,
                                career: created.career,
                                controlNumber: created.controlNumber,
                                isGraduate: isGraduate,
                                englishApproved: englishApproved
                            };
                            // Se retorna el usuario y token
                            return res.json(
                                formatUser
                            );
                        }).catch(err => {
                            console.log(err);
                            return res.status(status.NOT_FOUND).json({
                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                            });
                        });
                }
            }
        });

    } else {
        return res.status(status.NOT_FOUND).json({
            error: 'Número de control incorrecto'
        });
    }
}

const _findUser = (query) => {
    return new Promise((resolve) => {
        _user.findOne(query)
            .populate({
                path: 'employeeId', model: 'Employee',
                select: {
                    name: 1, _id: 0
                }
            })
            .then((user) => resolve(user))
            .catch((_) => resolve(null));
    });
};

const _findCompany = (query) => {
    return new Promise((resolve) => {
        _user.findOne(query)
            .populate({
                path: 'idRole', model: 'Role',
                select: {
                    permissions: 1, name: 1, _id: 0
                },
                populate: { path: 'permissions', model: 'Permission', select: '-_id', options: { sort: 'category' } }
            })
            .populate({
                path: 'companyId', model: 'Company',
                select: {
                    companyName: 1, _id: 0
                }
            })
            .then((company) => resolve(company))
            .catch((_) => resolve(null));
    });
};

const _findStudent = (query) => {
    return new Promise((resolve) => {
        _student.findOne(query)
            .populate({
                path: 'idRole', model: 'Role',
                select: {
                    permissions: 1, name: 1, _id: 0
                },
                populate: { path: 'permissions', model: 'Permission', select: '-_id', options: { sort: 'category' } }
            }).populate({
                path: 'careerId', model: 'Career',
                select: {
                    fullName: 1, shortName: 1, acronym: 1
                }
            })
            .then((student) => resolve(student))
            .catch((_) => resolve(null));
    });
}

const _createStudent = (data) => {
    return new Promise((resolve) => {
        _student.create(data)
            .then((_) => resolve(true))
            .catch((_) => resolve(false));
    });
};

const _loginSii = (controlNumber, nip) => {
    const dataStudent = JSON.stringify({
        nc: controlNumber,
        nip: nip
    });
    console.log(dataStudent);
    const studentLoginWs = {
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
    return new Promise((resolve) => {
        const request = https.request(studentLoginWs, (apiLogin) => {
            let loginData;
            apiLogin.on('data', async (data) => {
                loginData = data;
            });
            apiLogin.on('end', async () => {
                loginData = JSON.parse(loginData);
                console.log(loginData);
                if (loginData.error) {
                    return resolve(false);
                }
                resolve(true);
            });
        });
        request.on('error', (_) => {
            resolve(false);
        });
        request.write(dataStudent);
        request.end();
    });
};

const verifyLoginSii = async (req, res) => {
    let { email, password } = req.body;
    email = (email || '').toString().trim();

    if (!email || !(password || '').trim()) {
        return res.status(status.NOT_FOUND).json({
            error: 'Usuario y/o contraseña son incorrectos'
        });
    }

    if (/^[A-Za-z]{0,3}[0-9]{8}$/.test(email)) {
        const login = await _loginSii(email, password);
        if (login) {
            return res.status(200).json(true);
        } else {
            return res.status(status.NOT_FOUND).json({
                error: 'Usuario y/o contraseña son incorrectos'
            });
        }
    } else {
        return res.status(status.NOT_FOUND).json({
            error: 'Usuario y/o contraseña son incorrectos'
        });
    }


};

const _getStudentSii = (controlNumber) => {
    return new Promise((resolve) => {
        const studentInfoWs = {
            "rejectUnauthorized": false,
            host: 'wsescolares.tepic.tecnm.mx',
            port: 443,
            path: `/alumnos/info/${controlNumber}`,
            headers: {
                'Authorization': 'Basic ' + new Buffer.from('tecnm:35c0l4r35').toString('base64')
            }
        };
        https.get(studentInfoWs, function (apiInfo) {
            let studentData;
            apiInfo.on('data', (data) => {
                studentData = data;
            });
            apiInfo.on('end', async () => {
                //json con los datos del alumno
                studentData = JSON.parse(studentData);
                if (studentData.error) {
                    return resolve(false);
                }
                let studentNew = {
                    controlNumber: controlNumber,
                    fullName: `${studentData.firstname} ${studentData.fatherlastname} ${studentData.motherlastname}`,
                    career: eCareers[studentData.career],
                    nss: studentData.nss,
                    documents: [],
                    firstName: studentData.firstname,
                    fatherLastName: studentData.fatherlastname,
                    motherLastName: studentData.motherlastname,
                    birthPlace: studentData.birthplace,
                    dateBirth: studentData.datebirth,
                    civilStatus: studentData.civilstatus,
                    email: studentData.email,
                    status: studentData.status,
                    curp: studentData.curp,
                    sex: studentData.sex,
                    street: studentData.street,
                    suburb: studentData.suburb,
                    city: studentData.city,
                    state: studentData.state,
                    cp: studentData.cp,
                    phone: studentData.phone,
                    originSchool: studentData.originschool,
                    nameOriginSchool: studentData.nameoriginschool,
                    semester: studentData.semester,
                    creditsCareer: studentData.credits,
                    percentCareer: studentData.percent
                };
                const incomingType = studentData.income;
                if (studentNew.semester === 1 || ['1', '2', '3', '4'].includes(incomingType)) {
                    studentNew.stepWizard = 0;
                }
                studentNew.careerId = await getCareerId(studentNew.career);
                studentNew.idRole = await getRoleId('Estudiante');
                resolve(studentNew);
            });
            apiInfo.on('error', function (e) {
                resolve(false);
            });
        });
    });
};

const _getRoleById = (roleId) => {
    return new Promise((resolve) => {
        _role.findOne({ _id: roleId })
            .populate({ path: 'permissions', model: 'Permission', select: '-_id', options: { sort: 'category' } })
            .select('-description -_id')
            .then((role) => resolve(role))
            .catch((_) => resolve(null));
    });
};

module.exports = (User, Student, Employee, Role, Career, English, IMSS) => {
    _user = User;
    _student = Student;
    _employee = Employee;
    _role = Role;
    _career = Career;
    _english = English;
    _imss = IMSS;
    return ({
        register,
        login,
        getAll,
        getStatusDegree,
        getDataEmployee,
        updateUserData,
        getSecretaries,
        updateCareersUser,
        studentLogin,
        updateFullName,
        loginMiGraduacion,
        titledRegister,
        verifyLoginSii
    });
};
