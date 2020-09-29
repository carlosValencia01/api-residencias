const status = require('http-status');
const handler = require('../../utils/handler');
const stream = require('stream');
const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { eOperation } = require('../../enumerators/reception-act/enums');
var toUint8Array = require('base64-to-uint8array');

let _folder;
let _student;
let _period;

var auth;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


// Load client secrets from a local file.
fs.readFile('utils/credentials-google-driveAPI.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    //   authorize(JSON.parse(content), listFiles);    
    authorize(JSON.parse(content));
});
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        // callback(oAuth2Client);
        auth = oAuth2Client;

    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        return oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            //   callback(oAuth2Client);
            auth = oAuth2Client;
        });
    });
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
const createFolder = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const { folderName, period, type } = req.body;

    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder'
    };
    drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
    }, function (err, folder) {
        if (err) {
            res.status(status.BAD_REQUEST).json({
                error: err,
                action: 'create folder'
            });
        }
        else {
            _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id, type: type }).then(
                created => {

                    res.status(status.OK).json({
                        folder: created,
                        action: 'create folder'
                    });
                }
            ).catch(err => {

                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                })
            });
        };
    });

};
const createFolderIntoFolder = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const { folderName, period, parentFolderId, type } = req.body;
    // console.log(folderName, period, parentFolderId );

    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parentFolderId]
    };
    drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
    }, function (err, folder) {
        if (err) {
            console.log(err);

            res.status(status.BAD_REQUEST).json({
                error: err,
                action: 'create folder'
            });
        }
        else {
            _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id, type: type }).then(
                created => {

                    res.status(status.OK).json({
                        folder: created,
                        idFolderInDrive: folder.data.id,
                        action: 'create folder'
                    });
                }
            ).catch(err => {
                console.log(err.toString());

                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                });
            });
        };
    });

};

/**
 * create new file and save it in google drive
 * 
 */
const createOrUpdateFile = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const content = req.body;
    const files = req.files;
    const bodyMedia = files.file.data;
    const mimeType = files.file.mimetype;

    console.log(content,'create-update');

    //create bufferStream of document to save into google drive
    const buffer = Uint8Array.from(bodyMedia);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    let media = {
        mimeType: mimeType,
        body: bufferStream
    };

    const image = files.file.name.split('.');
    const nameInDrive = req.body.filename.indexOf('FOTO') > 0 ? req.body.filename + '.' + image[image.length - 1] : req.body.filename;
    if (content.newF == 'true') { //create new file
        const folderId = content.folderId;

        // name for display in google drive
        let fileMetadata = {
            name: nameInDrive,
            mimeType: mimeType,
            parents: [folderId]
        };
        drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        },
            (err, file) => {
                if (err) {
                    res.status(status.BAD_REQUEST).json({
                        error: err,
                        action: 'create file'
                    });
                } else {
                    res.status(201).json({
                        fileId: file.data.id,
                        name: fileMetadata.name,
                        mimeType: mimeType,
                        action: 'create file'
                    });
                }
            });
    } else if (content.newF == 'false') { // update file
        drive.files.update({
            fileId: content.fileId,
            media: media,
        }, (err, file) => {
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'update file1'
                });
            }else{
                res.status(status.OK).json({                
                    action: 'update file1',
                    name:nameInDrive
                });
            }
        });
    }


};


const deleteFile = (req, res) => {

    const drive = google.drive({ version: 'v3', auth });

    const fileId = req.params.id;
    drive.files.delete({
        fileId: fileId,
        fields: 'id'
    },
        (err, file) => {
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'delete file'
                });
            }
            else {
                res.status(status.OK).json({
                    fileId: file.data.id,
                    action: 'delete file'
                });
            }
        });
};

const getAllFolders = (req, res) => {
    _folder.find({}).populate({
        path: 'idPeriod', model: 'Period',
        select: {
            active: 1, name: 1, _id: 1
        }
    }).exec(handler.handleMany.bind(null, 'folders', res));
};
const getFoldersByPeriod = (req, res) => {
    const query = {
        idPeriod: req.params.period,
        type: req.params.type
    };

    _folder.find(query).populate({
        path: 'idPeriod', model: 'Period',
        select: {
            active: 1, name: 1, _id: 1
        }
    }).exec(handler.handleMany.bind(null, 'folders', res));
};

const downloadFile = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const { fileId, fileName } = req.body; // enviado desde el cliente
    console.log(fileId, fileName, 'download');

    //const fileId='10pp_v89K1DBlszNLwPbSjoOBNV8DdAsH'; //pdf
    //const fileName = '14400975-CURP.pdf';//pdf
    // const fileId='1H75kViaYggVmzQOniWjvW__q-zmdttD_'; //img
    // const fileName = '15401011-FOTO.png';//img
    // const mimeType='application/pdf';//pdf    
    if (fileName && fileId) {

        const path = 'documents/tmpFile/' + fileName;
        let dest = fs.createWriteStream(path);
        drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' },
            (err, file) => {
                if (err) console.log(err);
                file.data.
                    on('end', () => {
			
			setTimeout( async () => {
                            
                            await fs.readFile(path, (error, data) => {
                                
    
                                if (error) {
                                    console.log(error, '-=-=-=-=-=-=-=-=-', data);
                                    return res.status(status.BAD_REQUEST).json({
                                        error: error,
                                        action: 'download file'
                                    });
                                }
                                fs.unlinkSync(path);
                                res.status(status.OK).json({
                                    action: 'get file',
                                    contentType: file.headers['content-type'],
                                    file: fileName.indexOf('png') !== -1 || fileName.indexOf('jpg') !== -1 || fileName.indexOf('PNG') !== -1 || fileName.indexOf('JPG') !== -1 || fileName.indexOf('jpeg') !== -1 || fileName.indexOf('JPEG') !== -1 ? data.toString('base64') : data
                                });
                            });
                        }, 300);

                    }).on('error', (err) => {
                        console.log('===--==', err);
                        res.status(status.BAD_REQUEST).json({
                            error: err,
                            action: 'download file'
                        });

                    }).pipe(dest);
            }
        );
    } else {
        res.status(304).json({
            action: 'get file - not f',

        });
    }

};

const downloadPhoto = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const { fileId, fileName } = req.body; // enviado desde el cliente
    console.log(fileId, fileName, 'download');


    if (fileName && fileId) {
        if (fileName.indexOf('FOTO') !== -1) {

            const path = 'documents/tmpFile/' + fileName;
            let dest = fs.createWriteStream(path);
            drive.files.get({
                fileId: fileId,
                alt: 'media'
            }, { responseType: 'stream' },
                (err, file) => {
                    if (err) {
                        console.log('===-**-==', err);
                        res.status(status.BAD_REQUEST).json({
                            error: err,
                            action: 'download file'
                        });

                    } else {

                        file.data.
                            on('end', () => {

                                setTimeout( async () => {
                            
                            await fs.readFile(path, (error, data) => {
                                
    
                                if (error) {
                                    console.log(error, '-=-=-=-=-=-=-=-=-', data);
                                    return res.status(status.BAD_REQUEST).json({
                                        error: error,
                                        action: 'download file'
                                    });
                                }
                                fs.unlinkSync(path);
                                res.status(status.OK).json({
                                    action: 'get file',
                                    contentType: file.headers['content-type'],
                                    file: fileName.indexOf('png') !== -1 || fileName.indexOf('jpg') !== -1 || fileName.indexOf('PNG') !== -1 || fileName.indexOf('JPG') !== -1 || fileName.indexOf('jpeg') !== -1 || fileName.indexOf('JPEG') !== -1 ? data.toString('base64') : data
                                });
                            });
                        }, 300);

                            }).on('error', (err) => {
                                console.log('===--==', err);
                                res.status(status.BAD_REQUEST).json({
                                    error: err,
                                    action: 'download file'
                                });

                            }).pipe(dest);
                    }
                }
            );
        } else {
            res.status(304).json({
                action: 'get file - not f',

            });
        }
    } else {
        res.status(404).json({
            action: 'get file - not found',

        });
    }
};


const createFile2 = async (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const { mimeType, nameInDrive, bodyMedia, folderId, newF, fileId } = req.body;
    console.log(nameInDrive, 'create2');
    

    let buffer = toUint8Array(bodyMedia);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    let media = await {
        mimeType: mimeType,
        body: bufferStream
    };

    if (newF) {

        // name for display in google drive
        let fileMetadata = {
            name: nameInDrive,
            mimeType: mimeType,
            parents: [folderId]
        };
        drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'

        },
            (err, file) => {

                if (err) {
                    res.status(status.BAD_REQUEST).json({
                        error: err,
                        action: 'create file'
                    });
                } else {
                    res.status(201).json({
                        fileId: file.data.id,
                        name: fileMetadata.name,
                        action: 'create file'
                    });
                }
            });
    } else if (!newF) { // update file
        drive.files.update({
            fileId: fileId,
            media: media,
        }, (err, file) => {
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'update file2'
                });
            }

            res.status(status.OK).json({
                action: 'update file2',
                filename: nameInDrive
            });
        });
    }

};

const createFolderFromServer = (req, res) => {

    const { nc, type } = req.params;



    _student.findOne({ controlNumber: nc }).then(
        async student => {
            // console.log('1');
            if (student) {

                if(type == 1){

                    const folderId1 = await getFolderId(student._id);
    
                    if (folderId1) {
                        res.status(status.OK).json({ folderIdInDrive: folderId1.idFolderInDrive });
                    } else {
    
                        const period = await getActivePeriod();
                        if (period) {
                            const folderName = `${nc} - ${student.fullName}`;
                            const folderId = await getFolderByPeriod(period, student.career, folderName, type);
                            // console.log(folderId);
    
                            const result = await updateFolderIdStudent(student._id, folderId.folderId);
                            if (result) {
                                res.status(status.OK).json({ folderIdInDrive: folderId.folderDrive });
                            } else {
                                res.status(status.BAD_REQUEST).json({ err: "No se pudo crear la carpeta." });
                            }
                        } else {
                            res.status(status.BAD_REQUEST).json({ err: "No hay periodo activo" });
                        }
                    }
                }else if(type == 2){
                    const folderId2 = await getFolderId2(student._id);
    
                    if (folderId2) {
                        res.status(status.OK).json({ folderIdInDrive: folderId2.idFolderInDrive });
                    } else {
    
                        const period = await getActivePeriod();
                        if (period) {
                            const folderName = `${nc} - ${student.fullName}`;
                            const folderId = await getFolderByPeriod(period, student.career, folderName, type);
                            // console.log(folderId);
    
                            const result = await updateFolderId2Student(student._id, folderId.folderId);
                            if (result) {
                                res.status(status.OK).json({ folderIdInDrive: folderId.folderDrive });
                            } else {
                                res.status(status.BAD_REQUEST).json({ err: "No se pudo crear la carpeta." });
                            }
                        } else {
                            res.status(status.BAD_REQUEST).json({ err: "No hay periodo activo" });
                        }
                    }
                }
            } else {
                res.status(status.NOT_FOUND).json({ err: "Estudiante no encontrado" });
            }

        }
    ).catch(err => {
        console.log(err);

        res.status(status.NOT_FOUND).json({ err: err })
    });

};

const updateFolderIdStudent = (_id, folderId) => {

    const push = { $set: { folderId: folderId } };
    return new Promise(async resolve => {
        _student.updateOne({ _id: _id }, push, { new: true }).then(
            updated => {
                resolve(true);
            },
            err => {
                resolve(false);
            }
        ).catch(err => resolve(err));
    });
};
const updateFolderId2Student = (_id, folderId) => {

    const push = { $set: { folderIdRecAct: folderId } };
    return new Promise(async resolve => {
        _student.updateOne({ _id: _id }, push, { new: true }).then(
            updated => {
                resolve(true);
            },
            err => {
                resolve(false);
            }
        ).catch(err => resolve(err));
    });
};

const createSubFolder = async (folderName, parentFolderId, period, type) => {
    const drive = google.drive({ version: 'v3', auth });
    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parentFolderId]
    };
    return new Promise(async (resolve) => {
        drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        }, function (err, folder) {
            if (err) {
                console.log(err);

                resolve(false);
            }
            else {
                _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id, type: type }).then(
                    created => {

                        resolve({ folderDrive: folder.data.id, folderId: created._id });
                    }
                ).catch(err => {
                    console.log(err.toString());
                    resolve(false);
                });
            };
        });
    });
};

const createFile = async (nameInDrive, mimeType, folderId, filePath) => {
    const drive = google.drive({ version: 'v3', auth });
    let fileMetadata = {
        name: nameInDrive,
        mimeType: mimeType,
        parents: [folderId]
    };

    // file content to upload
    let media = await {
        mimeType: mimeType,
        body: fs.createReadStream(filePath)
    };

    return new Promise(async (resolve) => {
        drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'

        },
            (err, file) => {
                fs.unlinkSync(filePath);//delete file from server
                if (err) {
                    resolve(false);
                } else {
                    resolve({ id: file.data.id });
                }
            });
    });
};

const getActivePeriod = () => {

    return new Promise(async (resolve) => {
        await _period.findOne({ active: true }, (err, period) => {


            if (!err && period) {
                resolve(period);
            } else {
                resolve(false);
            }
        });
    });
};
const getFolderByPeriod = (period, career, name, type) => {
    const query = {
        idPeriod: period._id,
        type
    };

    return new Promise(async (resolve) => {
        await _folder.find(query, async (err, folders) => {

            if (!err && folders) {
                // console.log(period,career,name);

                const periodFolder = folders.filter(folder => folder.name.indexOf(period.periodName) !== -1);
                // console.log(periodFolder,'folders');
                const careerFolder = folders.filter(folder => folder.name.indexOf(career) !== -1);
                if (careerFolder.length === 0) {
                    const careerFolderId = await createSubFolder(career, periodFolder[0].idFolderInDrive, period._id, type);
                    const studentFolderId = await createSubFolder(name, careerFolderId.folderDrive, period._id);
                    resolve(studentFolderId);
                } else {
                    const studentFolderId = await createSubFolder(name, careerFolder[0].idFolderInDrive, period._id, type);
                    resolve(studentFolderId);
                }
            } else {
                resolve(false);
            }
        });
    });

};

const getFolderId = (_id) => {

    return new Promise(async (resolve) => {
        await _student.findOne({ _id: _id }, (err, student) => {

            if (!err && student) {
                resolve(student.folderId);
            } else {
                resolve(false);
            }
        }).populate({
            path: 'folderId', model: 'Folder',
            select: {
                idFolderInDrive: 1
            }
        });
    });
};
const getFolderId2 = (_id) => {

    return new Promise(async (resolve) => {
        await _student.findOne({ _id: _id }, (err, student) => {

            if (!err && student) {
                resolve(student.folderIdRecAct);
            } else {
                resolve(false);
            }
        }).populate({
            path: 'folderIdRecAct', model: 'Folder',
            select: {
                idFolderInDrive: 1
            }
        });
    });
};

const updatePhotoName = (req, res) => {
    const { _id } = req.params;

};

//Subir archivo para Acto_Recepcional
const uploadFile = async (req, operation = eOperation.NEW, isJsPdf = false) => {
    const drive = google.drive({ version: 'v3', auth });

    const content = req.body;
    const files = isJsPdf ? content.file : req.files;    
    const bodyMedia = isJsPdf ? files.data : files.file.data;
    const mimeType = isJsPdf ? files.mimetype : files.file.mimetype;
    //create bufferStream of document to save into google drive
    const buffer = isJsPdf ? toUint8Array(bodyMedia) : Uint8Array.from(bodyMedia);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    let media;
    if (isJsPdf) {
        media = await {
            mimeType: mimeType,
            body: bufferStream
        };
    } else {
        media = {
            mimeType: mimeType,
            body: bufferStream
        };
    }
    const nameInDrive = content.Document + path.extname((isJsPdf ? files.name : files.file.name));
    let response;
    switch (operation) {
        case eOperation.NEW: {
            const folderId = content.folderId;
            let fileMetadata = {
                name: nameInDrive,
                mimeType: mimeType,
                parents: [folderId]
            };

            response = await new Promise(resolve => {
                drive.files.create({ requestBody: fileMetadata, media: media, fields: 'id' },
                    (err, file) => {
                        if (err) {
                            console.log("Error New", err);
                            resolve({ isCorrect: false });
                        } else {
                            resolve({ isCorrect: true, fileId: file.data.id });
                            // return { isCorrect: true, fileId: file.data.id };
                        }
                    });
            });
            break;
        }
        case eOperation.EDIT: {
            response = await new Promise(resolve => {
                drive.files.update({ fileId: content.fileId, media: media },
                    (err, file) => {
                        if (err) {
                            console.log("Error Edit", err);
                            resolve({ isCorrect: false });
                        }
                        else {
                            resolve({ isCorrect: true });
                        }
                    });
            });
            break;
        }
    }
    return response;
};

const downloadToLocal = async (fileId, tmpName) => {
    const drive = google.drive({ version: 'v3', auth });
    var dest = fs.createWriteStream(`documents/tmpFile/${tmpName}`);
    response = await new Promise(resolve => {
        drive.files.get({
            fileId: fileId,
            alt: 'media'
        },
            { responseType: 'stream' },
            (err, file) => {
                if (err)
                    resolve(false);
                file.data.on('end', function () {
                    resolve(true);
                }).on('error', function (err) {
                    console.log('Error during download', err);
                    resolve(false);
                }).pipe(dest);

            }
        );
    });
    return response;
}

const getWebLink = async (fileId) => {
    const drive = google.drive({ version: 'v3', auth });
    let response;
    response = await new Promise(resolve => {
        drive.files.get({
            fileId: fileId, fields: 'webViewLink'
        }).then(
            (success) => {
                console.log("SUCE",success);
                resolve({ isCorrect: true, WebLink: success.data.webViewLink });
            }, (failed) => {
                resolve({ isCorrect: false, WebLink: '' });
            }
        );
    });
    return response;
}

const createFileSchedule = async (documentInfo,carrera) => {

    switch (carrera) {
        case ('INGENIERÍA ELÉCTRICA'):
            emailCoordinator = 'coordinacion.ie.im@ittepic.edu.mx';
            break;
        case ('INGENIERÍA MECATRÓNICA'):
            emailCoordinator = 'coordinacion.ie.im@ittepic.edu.mx';
            break;
        case ('INGENIERÍA EN SISTEMAS COMPUTACIONALES'):
            emailCoordinator = 'coordinacion.isc.itic@ittepic.edu.mx';
            break;
        case ('INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES'):
            emailCoordinator = 'coordinacion.isc.itic@ittepic.edu.mx';
            break;
        case ('INGENIERÍA INDUSTRIAL'):
            emailCoordinator = 'coordinacion.ii@ittepic.edu.mx';
            break;
        case ('INGENIERÍA QUÍMICA'):
            emailCoordinator = 'coordinacion.iq.ibq@ittepic.edu.mx';
            break;
        case ('INGENIERÍA BIOQUÍMICA'):
            emailCoordinator = 'coordinacion.iq.ibq@ittepic.edu.mx';
            break;
        case ('INGENIERÍA EN GESTIÓN EMPRESARIAL'):
            emailCoordinator = 'coordinacion.ige@ittepic.edu.mx';
            break;
        case ('INGENIERÍA CIVIL'):
            emailCoordinator = 'coordinacion.ic@ittepic.edu.mx';
            break;
        case ('ARQUITECTURA'):
            emailCoordinator = 'coordinacion.arquitectura@ittepic.edu.mx';
            break;
        case ('LICENCIATURA EN ADMINISTRACIÓN'):
            emailCoordinator = 'Coordinacion.la@ittepic.edu.mx';
            break;  
        default:
            emailCoordinator = '';
            break;
    }

      const permissions = [
        {
          'type': 'user',
          'role': 'reader',
          'emailAddress': emailCoordinator
        },
        {
            'type': 'user',
            'role': 'reader',
            'emailAddress': 'divestudiosprof@ittepic.edu.mx'
          }
      ];


    return new Promise ( async (resolve) => {
        const drive = google.drive({ version: 'v3', auth });
        const { mimeType, nameInDrive, bodyMedia, folderId, newF, fileId } = documentInfo;

        let buffer = toUint8Array(bodyMedia);
        let bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
    
        let media = await {
            mimeType: mimeType,
            body: bufferStream
        };
    
        if (newF) { // Guardar nuevo documento
            console.log('Guardando nuevo horario en drive');
            let fileMetadata = {
                name: nameInDrive,
                mimeType: mimeType,
                parents: [folderId]
            };
            drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id'
            },
            (err, file) => {
                if (err) { 
                    console.log(err);
                    resolve(''); 
                }  else { 
                        permissions.forEach(permission => {
                            if(permission.emailAddress !== ''){
                                drive.permissions.create({
                                    fileId: file.data.id,
                                    fields: 'id',
                                    sendNotificationEmail: false,
                                    resource: permission
                                  },function (err, res) {
                                    if (err) {
                                      console.error('Error al compartir archivo con '+permission.emailAddress);
                                    } else {
                                      console.log('Compartiendo archivo con '+permission.emailAddress);
                                    }
                                  });
                            }
                        });
                        resolve({
                            fileId: file.data.id,
                            name: fileMetadata.name,
                            action: 'create'
                        }); 
                    }
            });
        } else if (!newF) { // Modificar documento
            console.log('Actualizando horario en drive');
            drive.files.update({
                fileId: fileId,
                media: media,
            },
            (err, file) => {
                if (err) { resolve(false); } 
                else {
                    resolve({
                        fileId: file.data.id,
                        action: 'update'
                    }); 
                }
            });
        }
    });
};

const createSubFolder2 = async (_folderName,_period,_parentFolderId,_type) => {
    return new Promise ( async (resolve) => {
        const drive = google.drive({ version: 'v3', auth });
        
        const folderName = _folderName;
        const period = _period;
        const parentFolderId = _parentFolderId; 
        const type = _type;

        var fileMetadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parentFolderId]
        };
        drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        }, function (err, folder) {
            if (err) {
                resolve(false);
            }
            else {
                _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id, type: type }).then(
                    created => {
                        resolve(created);
                    }
                ).catch(err => {
                    resolve(false);
                });
            };
        });
    });
};

const createOrUpdateFileGraduation = (req, res) => {
    const drive = google.drive({ version: 'v3', auth });
    const content = req.body;
    const files = req.files;
    const bodyMedia = files.file.data;
    const mimeType = files.file.mimetype;
    const typeDoc = files.file.mimetype.split('/')[1];

    //create bufferStream of document to save into google drive
    const buffer = Uint8Array.from(bodyMedia);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    let media = {
        mimeType: mimeType,
        body: bufferStream
    };

    const nameInDrive = req.body.filename+'.'+typeDoc;
    if (content.newF == 'true') { //create new file
        const folderId = content.folderId;

        // name for display in google drive
        let fileMetadata = {
            name: nameInDrive,
            mimeType: mimeType,
            parents: [folderId]
        };
        drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        },
            (err, file) => {
                if (err) {
                    res.status(status.BAD_REQUEST).json({
                        error: err,
                        action: 'create file'
                    });
                } else {
                    res.status(status.OK).json({
                        fileId: file.data.id,
                        name: fileMetadata.name,
                        mimeType: mimeType,
                        action: 'create file'
                    });
                }
            });
    } else if (content.newF == 'false') { // update file
        drive.files.update({
            fileId: content.fileId,
            media: media,
            resource: { name: nameInDrive }
        }, (err, file) => {
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'update file'
                });
            }else{
                res.status(status.OK).json({                
                    action: 'update file',
                    name:nameInDrive,
                    fileId: file.data.id
                });
            }
        });
    }

}

module.exports = (Folder, Student, Period) => {
    _folder = Folder;
    _student = Student;
    _period = Period;

    return ({
        createOrUpdateFile,
        createFolder,
        createFolderIntoFolder,
        deleteFile,
        getAllFolders,
        getFoldersByPeriod,
        downloadFile,
        createFile2,
        downloadPhoto,
        createFolderFromServer,
        uploadFile,
        downloadToLocal,
        getWebLink,
        getActivePeriod,
        createFileSchedule,
        createSubFolder2,
        createOrUpdateFileGraduation,
    });
};

