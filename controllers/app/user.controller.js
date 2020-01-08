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

const getAll = (req, res) => {
    _user.find({})
        .select({ 'password': 0 })
        .exec(handler.handleMany.bind(null, 'users', res));
};

const getSecretaries = async (req,res)=>{
    const idRole = await getRoleId('Secretaria escolares');

    if(idRole){                
        _user.find({idRole:idRole},{password:0,idRole:0,email:0,role:0})
        .populate({
            path: 'employeeId', model: 'Employee',
            select: {
                name: 1,_id:0
            }
        }).populate({
            path: 'careers.careerId', model: 'Career',
            select: {
                fullName: 1,shortName:1,acronym:1
            }
        }).then(
            users=>{
                if(users){
                    res.status(status.OK).json({users:users});
                }else{
                    res.status(status.NOT_FOUND).json({msg:"Not found"});
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

// const login = (req, res) => { //si no se puede conectar con el sii
//     const { email, password } = req.body;
//     let query = { email: email };

//     _user.findOne(query)
//         .populate({
//             path: 'idRole', model: 'Role',
//             select: {
//                 permissions: 1, name: 1, _id: 0
//             }
//         })
//         .populate({
//             path: 'employeeId', model:'Employee',
//             select: {
//                 name: 1, _id: 0
//             }
//         })
//         .exec((err, user) => {
//             if (err) {
//                 return res.status(status.INTERNAL_SERVER_ERROR).json({
//                     error: err.toString()
//                 });
//             }
            
            
//             if (user) {
//                 console.log(user,'==========user');
//                 user.validatePasswd(password, user.password, invalid => {
//                     // Password inválido
//                     if (invalid) {
//                         return res.status(status.FORBIDDEN).json({
//                             error: 'password is invalid'
//                         });
//                     }
//                     // Password válido, se genera el token
//                     const token = jwt.sign({ email: user.email }, config.secret);
//                     let formatUser = {
//                         _id: user._id,
//                         name: {
//                             firstName: user.employeeId.name.firstName,
//                             lastName: user.employeeId.name.lastName,
//                             fullName: user.employeeId.name.fullName
//                         },
//                         email: user.email,
//                         role: user.role,
//                         rol: {
//                             name: user.idRole.name,
//                             permissions: user.idRole.permissions
//                         }
//                     };
//                     //Se retorna el usuario y token
//                     return res.json({
//                         user: formatUser,
//                         token: token,
//                         action: 'signin'
//                     });
//                 });
//             } else {

//                 let queryNc = { controlNumber: email };
//                                     // Buscamos sus datos en la BD local
                                    
                                    
//                                     _student.findOne(queryNc)
//                                         .populate({
//                                             path: 'idRole', model: 'Role',
//                                             select: {
//                                                 permissions: 1, name: 1, _id: 0
//                                             }
//                                         }).exec(async (error, oneUser) => {
//                                             // Hubo un error en la consulta
                                            
//                                             if (error) {
//                                                 console.log('Entra aquí');
//                                                 return res.status(status.NOT_FOUND).json({
//                                                     error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
//                                                 });
//                                             } else {
//                                                 // Se verifica si tiene aprobado el inglés
//                                                 console.log('1');
                                                
//                                                 let englishApproved = await validateEnglishApproved(email);
//                                                 console.log('2.3');
                                                
//                                                 // Se verifica si es egresado
//                                                 // let isGraduate = await validateGraduateStatus(email);
//                                                 let isGraduate = false;
//                                                 // Quitar permiso para acceder a la credencial
//                                                 if (isGraduate) {
//                                                     console.log('3');
                                                    
//                                                     oneUser.idRole.permissions = oneUser.idRole.permissions.filter(x => x.routerLink !== 'oneStudentPage');
//                                                 }
//                                                 console.log('2');
                                                
//                                                 // Si fue encontrado
//                                                 if (oneUser) {
//                                                     // Se contruye el token
//                                                     const token = jwt.sign({ email: oneUser.controlNumber }, config.secret);
//                                                     let formatUser = {
//                                                         _id: oneUser._id,
//                                                         name: {
//                                                             firstName: oneUser.firstName,
//                                                             lastName: `${oneUser.fatherLastName} ${oneUser.motherLastName}`,
//                                                             fullName: oneUser.fullName
//                                                         },
//                                                         email: oneUser.controlNumber,
//                                                         career: oneUser.career,
//                                                         rol: {
//                                                             name: oneUser.idRole.name,
//                                                             permissions: oneUser.idRole.permissions
//                                                         },
//                                                         english: englishApproved,
//                                                         graduate: isGraduate
//                                                     };
//                                                     // Se retorna el usuario y token
//                                                     return res.status(status.OK).json({
//                                                         user: formatUser,
//                                                         token: token,
//                                                         action: 'signin'
//                                                     });
//                                                 }
//                                             }
//                                         });
// /*

//                 // Validar si es alumno y su nc y NIP son válidos
//                 superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/validarAlumno/${email}/${password}`)
//                     .timeout({
//                         response: 5000,  // Wait 5 seconds for the server to start sending,
//                         deadline: 20000, // but allow 1 minute for the file to finish loading.
//                     }).then((res1) => {
//                         const respApi = res1.body;
//                         console.log(respApi,'============================');

//                         // Está registrado en el SII y su NIP y Password son correctos
//                         if (respApi.data && respApi.data.existe === '1') {
//                             const req3 = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/alumnoSeleccionMaterias/${email}/${config.period}`);
//                             req3.end();

//                             // Verificamos que tenga carga activa
//                             req3.on('response', (res2) => {
//                                 const respApi2 = res2.body;
//                                 console.log(respApi2);

//                                 // Tiene carga activa
//                                 if (respApi2 && respApi2.error === 'FALSE') {
//                                     console.log(respApi2);
                                    
//                                     console.log('Si tiene materias cargadas');
//                                     let queryNc = { controlNumber: email };
//                                     // Buscamos sus datos en la BD local
//                                     _student.findOne(queryNc)
//                                         .populate({
//                                             path: 'idRole', model: 'Role',
//                                             select: {
//                                                 permissions: 1, name: 1, _id: 0
//                                             }
//                                         }).exec(async (error, oneUser) => {
//                                             // Hubo un error en la consulta
//                                             if (error) {
//                                                 console.log('Entra aquí');
//                                                 return res.status(status.NOT_FOUND).json({
//                                                     error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
//                                                 });
//                                             } else {
//                                                 // Se verifica si tiene aprobado el inglés
//                                                 let englishApproved = await validateEnglishApproved(email);
//                                                 // Se verifica si es egresado
//                                                 let isGraduate = await validateGraduateStatus(email);
//                                                 // Quitar permiso para acceder a la credencial
//                                                 if (isGraduate) {
//                                                     oneUser.idRole.permissions = oneUser.idRole.permissions.filter(x => x.routerLink !== 'oneStudentPage');
//                                                 }
//                                                 // Si fue encontrado
//                                                 if (oneUser) {
//                                                     // Se contruye el token
//                                                     const token = jwt.sign({ email: oneUser.controlNumber }, config.secret);
//                                                     let formatUser = {
//                                                         _id: oneUser._id,
//                                                         name: {
//                                                             firstName: respApi2.data.nombre_alumno,
//                                                             lastName: `${respApi2.data.apellido_paterno} ${respApi2.data.apellido_materno}`,
//                                                             fullName: oneUser.fullName
//                                                         },
//                                                         email: oneUser.controlNumber,
//                                                         career: oneUser.career,
//                                                         rol: {
//                                                             name: oneUser.idRole.name,
//                                                             permissions: oneUser.idRole.permissions
//                                                         },
//                                                         english: englishApproved,
//                                                         graduate: isGraduate
//                                                     };
//                                                     // Se retorna el usuario y token
//                                                     return res.json({
//                                                         user: formatUser,
//                                                         token: token,
//                                                         action: 'signin'
//                                                     });
//                                                 } else {
//                                                     // No se encontró el registro en la base de datos local
//                                                     const fatherName = (respApi2.data.apellido_paterno && respApi2.data.apellido_paterno !== ' ') ? ' ' + respApi2.data.apellido_paterno : '';
//                                                     const motherName = (respApi2.data.apellido_materno && respApi2.data.apellido_materno !== ' ') ? ' ' + respApi2.data.apellido_materno : '';

//                                                     // Obtener id del rol para estudiente
//                                                     const studentId = await getRoleId('Estudiante');
//                                                     let studentNew = {
//                                                         fullName: respApi2.data.nombre_alumno + fatherName + motherName,
//                                                         controlNumber: respApi2.data.nocontrol,
//                                                         nip: password,
//                                                         career: ' ',
//                                                         //Rol a estudiante
                                                  
//                                                         idRole: studentId
//                                                     };

//                                                     switch (respApi2.data.carrera) {
//                                                         case 'L01':
//                                                             studentNew.career = 'ARQUITECTURA';
//                                                             break;
//                                                         case 'L02':
//                                                             studentNew.career = 'INGENIERÍA CIVIL';
//                                                             break;
//                                                         case 'L03':
//                                                             studentNew.career = 'INGENIERÍA ELÉCTRICA';
//                                                             break;
//                                                         case 'L04':
//                                                             studentNew.career = 'INGENIERÍA INDUSTRIAL';
//                                                             break;
//                                                         case 'L05':
//                                                             studentNew.career = 'INGENIERÍA EN SISTEMAS COMPUTACIONALES';
//                                                             break;
//                                                         case 'L06':
//                                                             studentNew.career = 'INGENIERÍA BIOQUÍMICA';
//                                                             break;
//                                                         case 'L07':
//                                                             studentNew.career = 'INGENIERÍA QUÍMICA';
//                                                             break;
//                                                         case 'L08':
//                                                             studentNew.career = 'LICENCIATURA EN ADMINISTRACIÓN';
//                                                             break;
//                                                         case 'L12':
//                                                             studentNew.career = 'INGENIERÍA EN GESTIÓN EMPRESARIAL';
//                                                             break;
//                                                         case 'L11':
//                                                             studentNew.career = 'INGENIERÍA MECATRÓNICA';
//                                                             break;
//                                                         case 'ITI':
//                                                             studentNew.career = 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES';
//                                                             break;
//                                                         case 'MTI':
//                                                             studentNew.career = 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN';
//                                                             break;
//                                                         case 'P01':
//                                                             studentNew.career = 'MAESTRIA EN CIENCIAS DE ALIMENTOS';
//                                                             break;
//                                                         case 'DCA':
//                                                             studentNew.career = 'DOCTORADO EN CIENCIAS DE ALIMENTOS';
//                                                             break;
//                                                         default:
//                                                             break;
//                                                     }

//                                                     console.log('Estudiante a guardar');
//                                                     console.log(studentNew);

//                                                     _student.create(studentNew)
//                                                         .then(created => {
//                                                             console.log('Estudiant creado');
//                                                             _student.findOne({_id: created._id})
//                                                                 .populate({
//                                                                     path: 'idRole', model: 'Role',
//                                                                     select: {
//                                                                         permissions: 1, name: 1, _id: 0
//                                                                     }
//                                                                 })
//                                                                 .exec((err, user) => {
//                                                                     // Se contruye el token
//                                                                     console.log(user,'soy user');
                                                                    
//                                                                     const token = jwt.sign({ email: user.controlNumber }, config.secret);
//                                                                     let formatUser = {
//                                                                         _id: user._id,
//                                                                         name: {
//                                                                             firstName: respApi2.data.nombre_alumno,
//                                                                             lastName: `${respApi2.data.apellido_paterno} ${respApi2.data.apellido_materno}`,
//                                                                             fullName: user.fullName
//                                                                         },
//                                                                         email: user.controlNumber,
//                                                                         career: user.career,
//                                                                         rol: {
//                                                                             name: user.idRole.name,
//                                                                             permissions: user.idRole.permissions
//                                                                         },
//                                                                         english: englishApproved,
//                                                                         graduate: isGraduate
//                                                                     };
//                                                                     // Se retorna el usuario y token
//                                                                     return res.json({
//                                                                         user: formatUser,
//                                                                         token: token,
//                                                                         action: 'signin'
//                                                                     });
//                                                                 });
//                                                         }).catch(err => {
//                                                             return res.status(status.NOT_FOUND).json({
//                                                                 error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
//                                                             });
//                                                         });
//                                                 }
//                                             }
//                                         });
//                                 } else {
//                                     return res.status(status.UNAUTHORIZED).json({
//                                         error: 'No puede ingresar debido a que no es alumno del periodo actual (No tiene materias cargadas)'
//                                     });
//                                 }
//                             });
//                         }
//                     }, err => {
//                         if(err.timeout) {
//                             return res.status(status.INTERNAL_SERVER_ERROR).json({
//                                 error: 'No se pudo conectar al SII, intente más tarde'
//                             });
//                         } else {
//                             return res.status(status.INTERNAL_SERVER_ERROR).json({
//                                 error: 'No se pudo conectar al SII, intente más tarde'
//                             });
//                         }
//                     });*/
//             }
//     });
// };

const login = (req, res) => {
    const { email, password } = req.body;
    let query = { email: email };
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
        nip:password
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
                        

                        // Está registrado en el SII y su NIP y Password son correctos
                        if (respApi.data && respApi.data.existe === '1') {
                            
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
                                                let englishApproved = await validateEnglishApproved(email);
                                                // Se verifica si es egresado
                                                let isGraduate = await validateGraduateStatus(email);
                                                // Quitar permiso para acceder a la credencial
                                                if (isGraduate) {
                                                    oneUser.idRole.permissions = oneUser.idRole.permissions.filter(x => x.routerLink !== 'oneStudentPage');
                                                }
                                                // Si fue encontrado
                                                if (oneUser) {
                                                    // Se contruye el token
                                                    // console.log(oneUser);
                                                    console.log('1');
                                                    
                                                    //verificar si se cambio de semestre
                                                   https.get(options, (apiInfo)=>{                                            
                                                       var studentInfo ="";
                                                        apiInfo.on('data', (data)=> {
                                                           studentInfo += data;
                                                        });
                                                        apiInfo.on('end', async ()=> {
                                                         //json con los datos del alumno
                                                         console.log('2');
                                                         
                                                         studentInfo = JSON.parse(studentInfo);                                  
                                                        //  console.log(studentInfo);
                                                        //  console.log(oneUser);
                                                         
                                                         if(studentInfo.semester > oneUser.semester){
                                                             oneUser.semester = studentInfo.semester;                            
                                                              _student.findOneAndUpdate({_id:oneUser._id},{$set:{semester:studentInfo.semester}}).then(ok=>{},err=>{});
                                                         }                                               
                                                        });
                                                });  
                                                setTimeout( ()=>{
                                                    console.log('3');
                                                    
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
                                                        semester: oneUser.semester
                                                    };
                                                    // Se retorna el usuario y token
                                                    return res.json({
                                                        user: formatUser,
                                                        token: token,
                                                        action: 'signin'
                                                    });
                                                },500);
                                                    
                                                } else {
                                                    // No se encontró el registro en la base de datos local buscar en el sii
                                                   
                                                    var studentNew = "";                                                                                                       
                                                    https.get(options, function(apiInfo){
                                                       
                                                        apiInfo.on('data', function(data) {
                                                           studentNew += data;
                                                        });
                                                        apiInfo.on('end', ()=> {
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
                                                        if(studentNew.semester == 1){
                                                            studentNew.stepWizard = 0;
                                                        }                                     
                                                        const request = https.request(optionsPost, (apiLogin) => {
                                                            var careerN="";                                                  
                                                            apiLogin.on('data', async (d) => {
                                                              careerN+=d;
                                                              
                                                             
                                                          });
                                                          apiLogin.on('end',async ()=>{
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
                                                            const studentId = await getRoleId('Estudiante');
                                                            studentNew.idRole = studentId;
                                                            studentNew.careerId = await getCareerId(studentNew.career);


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
                                                                          console.log();
                                                                          
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
                                                            });
                                                          });
                                                          request.on('error', (error) => {
                                                            return res.status(status.NOT_FOUND).json({
                                                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                                            });
                                                          });
                                                          
                                                          request.write(dataStudent);
                                                          request.end();

                                                          
                                                        });
                                                        apiInfo.on('error', function(e) {
                                                            return res.status(status.NOT_FOUND).json({
                                                                error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                                                            });
                                                        });
                                                });                                                    

                                                    
                                                }
                                            }
                                        });
                                    }
                                // } else {
                                //     return res.status(status.UNAUTHORIZED).json({
                                //         error: 'No puede ingresar debido a que no es alumno del periodo actual (No tiene materias cargadas)'
                                //     });
                                // }
                        //     });
                        // }
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

const updateFullName = (req,res)=>{
    const {nc} = req.params;
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
    https.get(options, function(apiInfo){
        
        apiInfo.on('data', function(data) {
            studentNew += data;
        });
        apiInfo.on('end', ()=> {
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
            
            _student.findOneAndUpdate({controlNumber:nc},studentNew, { new: true }).then(
                stu=>{
                    if(stu) res.status(status.OK).json({'action':'update fullname',stu});
                    else res.status(status.BAD_REQUEST).json({'err':'student not found'})
                }
            ).catch(err=>res.status(status.BAD_REQUEST).json({err:err}));           

            
        });
        apiInfo.on('error', function(e) {
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
};

const updateCareersUser = (req,res)=>{
    const careerId = req.body.careerId;
    const {action,_id} = req.params;
    console.log(req.body);
    
    console.log(careerId,action,_id);
    if(careerId){

        const query = {_id:_id};
        if(action === 'insert'){
            _user.findOneAndUpdate(query, {'$push':{careers:{careerId}}})
            .then(
                user=>{
                    if(user){
                        res.status(status.OK).json({msg:'updated'});
                    }else{
                        res.status(status.NOT_FOUND).json({err:'not found'});
                    }
                }
            ).catch(
                err=>{
                    console.log(err);
                    
                    res.status(status.NOT_FOUND).json({err:'not found'});
                }
            );
        }else if(action === 'delete'){
            _user.findOneAndUpdate(query, {'$pull':{careers:{careerId}}})
            .exec(handler.handleOne.bind(null, 'user', res));
        }
    }else{
        res.status(status.NOT_FOUND).json({err:'not found'});
    }
};

const validateEnglishApproved = (controlNumber) => {
    return new Promise(async (resolve) => {
        await _student.findOne({
            controlNumber: controlNumber,
            documents: {
                $elemMatch: {
                    type: 'Ingles'
                }
            }
        }, (err, doc) => {
            console.log(doc,'2.2',err);
            
            if (!err && doc) {
                resolve(true);
            }
            resolve(false);
        });
    });
};

const validateGraduateStatus = (controlNumber) => {
    return new Promise(async (resolve) => {
        const res = superagent.get(`${config.urlAPI}:8080/sii/restful/index.php/alumnos/estatusAlumno/${controlNumber}`);
        res.end()
        res.on('response', (data) => {
            const resStatus = data.body;
            if (resStatus && resStatus.error === 'FALSE') {
                if (resStatus.data.estatus_alumno === 'EGR') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
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

 const studentLogin = (req,res)=>{
    const {nc,nip} = req.body;
    _student.findOne({controlNumber: nc},{documents:0,idRole:0,fileName:0,acceptedTerms:0,dateAcceptedTerms:0,stepWizard:0,inscriptionStatus:0})
        .populate({
            path: 'careerId', model: 'Career',
            select: {
                fullName:1,shortName:1,acronym:1,_id:1
            }
        }).populate({
            path: 'folderId', model: 'Folder',
            select: {
                idFolderInDrive: 1
            }
        }).exec(async (error, oneUser) => {                                          
                if (oneUser) {
                    // Se contruye el token
                    if(oneUser.nip == nip){
                        const token = jwt.sign({ nc: oneUser.controlNumber }, config.secret);             
                        let {fullName,shortName,acronym,_id} = oneUser.careerId;
                        let career ={fullName,shortName,acronym,_id};                    
                        let user = {student:oneUser,career};
                        // user.student.career = undefined;                    
                        user.student.careerId = undefined;                    
                       
                        return res.status(status.OK).json({
                            user: user,
                            token: token,
                            action: 'signin'
                        });
                    }else{
                        return res.status(status.NOT_FOUND).json({
                            error: 'El nip proporcionado no es valido.'
                        });
                    }
                }else{
                    return res.status(status.NOT_FOUND).json({
                        error: 'No se encuentra registrado en la base de datos de credenciales. Favor de acudir al departamento de Servicios Escolares a darse de alta'
                    });
                }            
        });
 };

const getCareerId = (careerName) => {
    
    
    return new Promise(async (resolve) => {
        await _career.findOne({fullName:careerName}, (err, career) => {
            if (!err && career) {
                resolve(career.id);
            }
        });
    });
};
module.exports = (User, Student, Employee, Role,Career) => {
    _user = User;
    _student = Student;
    _employee = Employee;
    _role = Role;
    _career = Career;
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
    });
};
