const status = require('http-status');
let _folder;
const handler = require('../../utils/handler');
const stream = require('stream');
const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');

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
    const { folderName, period } = req.body;

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
            _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id }).then(
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
    const { folderName, period, parentFolderId } = req.body;

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
            res.status(status.BAD_REQUEST).json({
                error: err,
                action: 'create folder'
            });
        }
        else {
            _folder.create({ name: folderName, idPeriod: period, idFolderInDrive: folder.data.id }).then(
                created => {

                    res.status(status.OK).json({
                        folder: created,
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

    console.log(content);

    //create bufferStream of document to save into google drive
    const buffer = Uint8Array.from(bodyMedia);
    var bufferStream = new stream.PassThrough();
    bufferStream.end(buffer); 

    let media = {
        mimeType: mimeType,
        body: bufferStream
    };
    
    const image = files.file.name.split('.');
    const nameInDrive = req.body.filename.indexOf('FOTO') > 0 ? req.body.filename + '.' + image[image.length-1] : req.body.filename;
    if(content.newF=='true'){ //create new file
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
    }else if(content.newF=='false'){ // update file
        drive.files.update({
            fileId: content.fileId,
            media: media,
        }, (err, file) => {
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'update file1'
                });
            }
            res.status(status.OK).json({                
                action: 'update file1',
                name:nameInDrive
            });
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
        idPeriod: req.params.period
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
    //const fileId='10pp_v89K1DBlszNLwPbSjoOBNV8DdAsH'; //pdf
    //const fileName = '14400975-CURP.pdf';//pdf
    // const fileId='1H75kViaYggVmzQOniWjvW__q-zmdttD_'; //img
    // const fileName = '15401011-FOTO.png';//img
    // const mimeType='application/pdf';//pdf    
    const path = 'documents/tmpFile/' + fileName;
    let dest = fs.createWriteStream(path);
    drive.files.get({
        fileId: fileId,
        alt: 'media'
    }, { responseType: 'stream' },
        async (err, file) => {
            if (err) console.log(err);
            file.data.
                on('end', () => {
                    console.log('done');
                    fs.readFile(path, (error, data) => {
                        if (error) {
                            console.log(error, '-=-=-=-=-=-=-=-=-');
                            res.status(status.BAD_REQUEST).json({
                                error: error,
                                action: 'download file'
                            });
                        }
                        fs.unlinkSync(path);
                        res.status(status.OK).json({
                            action: 'get file',
                            file: fileName.indexOf('FOTO') !== -1 ? data.toString('base64') : data
                        });
                    });
                }).on('error', (err) => {
                    console.log('===--==', err);
                    res.status(status.BAD_REQUEST).json({
                        error: err,
                        action: 'download file'
                    });

                }).pipe(dest);
        }
    );

};
const createFile2 = async (req, res) => {    
    const drive = google.drive({ version: 'v3', auth });
    const { mimeType, nameInDrive, bodyMedia, folderId, newF,fileId} = req.body;
    const filePath = 'documents/tmpFile/' + nameInDrive;
    console.log(nameInDrive);
    
    await fs.writeFile(filePath,bodyMedia,'base64', (err) => {
        if (err) console.log('ERRORRRRR-----', err);
    });
    
    let media = await {
        mimeType: mimeType,
        body: fs.createReadStream(filePath)
    };
    console.log(newF,'-dasdado',folderId);
    if(newF){

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
            fs.unlinkSync(filePath);//delete file from server
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'create file'
                });
            } else {
                res.status(201).json({
                    fileId: file.data.id,
                    name: fileMetadata.name,
                    // mimeType:mimeType,
                    action: 'create file'
                });
            }
        });
    }else if(!newF){ // update file
        drive.files.update({
            fileId: fileId,
            media: media,
        }, (err, file) => {
            fs.unlinkSync(filePath);//delete file from server
            if (err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,
                    action: 'update file2'
                });
            }
            console.log('whyy');
            
            res.status(status.OK).json({                
                action: 'update file2',
                filename:nameInDrive
            });
        });
    }

};

module.exports = (Folder) => {
    _folder = Folder;
    return ({
        createOrUpdateFile,
        createFolder,
        createFolderIntoFolder,
        deleteFile,
        getAllFolders,
        getFoldersByPeriod,
        downloadFile,
        createFile2,       
    });
};

