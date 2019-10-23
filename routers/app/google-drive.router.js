const router = require('express').Router();

module.exports = (wagner) => {
    const driveCtrl = wagner.invoke((Folder) =>  require('../../controllers/app/google-drive.controller')(Folder));
    
    
    router.post('/create/folder', (req, res) =>
        driveCtrl.createFolder(req, res));
    router.post('/create/subfolder', (req, res) =>
        driveCtrl.createFolderIntoFolder(req, res));
    router.post('/upload/file', (req, res) =>
        driveCtrl.createFile(req, res)); 
    router.delete('/delete/file/:id', (req, res) =>
        driveCtrl.deleteFile(req, res));
    router.get('/get/folders/all', (req, res) =>
        driveCtrl.getAllFolders(req, res));
    router.get('/get/folders/period/:period', (req, res) =>
        driveCtrl.getFoldersByPeriod(req, res));
    router.get('/get/file', (req, res) =>
        driveCtrl.downloadFile(req, res));


    return router;
};
