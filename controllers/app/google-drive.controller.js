const status = require('http-status');
let _folder;
const handler = require('../../utils/handler');

const readline = require('readline');
const {google} = require('googleapis');
const fs = require('fs');

var auth;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
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
  const {client_secret, client_id, redirect_uris} = credentials.installed;
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
const createFolder = (req,res)=> {
    const drive = google.drive({version: 'v3', auth});
    const {folderName, period} = req.body;
    
    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder'
      };
      drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'        
      }, function (err, folder) {
        if(err) {
            res.status(status.BAD_REQUEST).json({
                error: err,        
                action: 'create folder'
            });
        }
        else { 
            _folder.create({name:folderName,idPeriod:period,idFolderInDrive:folder.data.id}).then(
                created=>{

                    res.status(status.OK).json({
                        folder: created,        
                        action: 'create folder'
                    });
                }
            ).catch(err =>{
                console.log(err.toString());
                
                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                })
            });
        };
      });
      
};
const createFolderIntoFolder = (req,res)=> {    
    const drive = google.drive({version: 'v3',auth});
    const {folderName, period,parentFolderId} = req.body;
    
    var fileMetadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents':[parentFolderId]
      };
      drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'        
      }, function (err, folder) {
        if(err) {
            res.status(status.BAD_REQUEST).json({
                error: err,        
                action: 'create folder'
            });
        }
        else {
            console.log(folder);
            
            _folder.create({name:folderName,idPeriod:period,idFolderInDrive:folder.data.id}).then(
                created=>{

                    res.status(status.OK).json({
                        folder: created,        
                        action: 'create folder'
                    });
                }
            ).catch(err =>{
                console.log(err.toString());
                
                res.status(status.INTERNAL_SERVER_ERROR).json({
                    error: err.toString()
                })
            });
        };
      });
      
};

/**
 * create new file and save it in google drive
 * 
 */
const createFile =  async (req,res)=> {
            
    const drive = google.drive({version: 'v3', auth});
    const content = req.body;
    const files = req.files;    
    
    
    const bodyMedia = files.file.data;
    const nameInDrive = req.body.filename.indexOf('FOTO') > 0 ? req.body.filename+'.'+files.file.name.split('.')[1] : req.body.filename;
    const folderId = content.folderId;
    const mimeType = files.file.mimetype;
        
    const filePath = 'documents/tmpFile/'+nameInDrive;
    
    
    await fs.writeFile(filePath,bodyMedia,'binary', (err)=>{
        if(err) console.log('ERRORRRRR-----',err);
    
    });
    // name for display in google drive
    let fileMetadata = {
        name:nameInDrive,
        mimeType:mimeType,
        parents:[folderId]
    };
    
    
    // file content to upload
    let media = await {
        mimeType:mimeType,
        body: fs.createReadStream(filePath)
    };

   
    
    drive.files.create({
        requestBody:fileMetadata,
        media:media,
        fields:'id'        

        },
        (err,file)=>{
            fs.unlinkSync(filePath);//delete file from server
            if(err) {
                res.status(status.BAD_REQUEST).json({
                    error: err,        
                    action: 'create file'
                });
            }else {              
                res.status(201).json({
                    fileId: file.data.id,
                    name:fileMetadata.name,
                    action: 'create file'
                });
            }                        
    });     
             
};
const deleteFile =  (req,res)=> {
    
    const drive = google.drive({version: 'v3', auth});
    
    const fileId = req.params.id;
   

    drive.files.delete({
        fileId:fileId,
        fields:'id'      
        },
        (err,file)=>{
            if(err) {
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
        idPeriod:req.params.period
    };
        
    _folder.find(query).populate({
        path: 'idPeriod', model: 'Period',
        select: {
            active: 1, name: 1, _id: 1
        }
    }).exec(handler.handleMany.bind(null, 'folders', res));
};

const putr = async (req,res)=>{
    
    console.log(req);
    
    res.status(status.OK).json({
        
        action: 'test'
    });
    
};

module.exports = (Folder) => {
  _folder = Folder;
  return ({
    createFile,
    createFolder,
    createFolderIntoFolder,
    deleteFile,
    putr,
    getAllFolders,
    getFoldersByPeriod,
  });
};

