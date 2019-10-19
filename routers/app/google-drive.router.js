const router = require('express').Router();

module.exports = () => {
    const driveCtrl =   require('../../controllers/app/google-drive.controller')();
    
    
    router.post('/create/folder/:name', (req, res) =>
        driveCtrl.createFolder(req, res));
    router.post('/create/subfolder/:name/:id', (req, res) =>
        driveCtrl.createFolderIntoFolder(req, res));
    router.post('/upload/file', (req, res) =>
        driveCtrl.createFile(req, res));
    router.post('/upload', (req, res) =>
        driveCtrl.putr(req, res));    
    router.delete('/delete/file/:id', (req, res) =>
        driveCtrl.deleteFile(req, res));

    return router;
};
