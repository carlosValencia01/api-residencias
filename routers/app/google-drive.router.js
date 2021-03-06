const router = require('express').Router();

module.exports = (wagner) => {
    const driveCtrl = wagner.invoke((Folder, Student, Period) =>  
    require('../../controllers/app/google-drive.controller')(Folder, 'Student', 'Period'));
    
    
    router.post('/create/folder', (req, res) =>
        driveCtrl.createFolder(req, res));
        
    router.post('/create/subfolder', (req, res) =>
        driveCtrl.createFolderIntoFolder(req, res));

    router.post('/upload/file', (req, res) =>
        driveCtrl.createOrUpdateFile(req, res)); 

    router.delete('/delete/file/:id', (req, res) =>
        driveCtrl.deleteFile(req, res));

    router.get('/get/folders/all', (req, res) =>
        driveCtrl.getAllFolders(req, res));

    router.get('/get/folders/period/:period/:type', (req, res) =>
        driveCtrl.getFoldersByPeriod(req, res));
        
    router.post('/get/file', (req, res) =>
        driveCtrl.downloadFile(req, res));

    router.post('/get/photo', (req, res) =>
        driveCtrl.downloadPhoto(req, res));

    router.post('/upload/file2', (req, res) =>
        driveCtrl.createFile2(req, res));     
        
    router.post('/upload/fileGraduation', (req, res) =>
        driveCtrl.createOrUpdateFileGraduation(req, res)); 
    return router;
};
