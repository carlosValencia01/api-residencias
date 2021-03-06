const router = require('express').Router();


module.exports = (wagner) => {
    const requestCtrl = wagner.invoke((Request, DenyDay, Folder, Student,Period,Department, Employee, Position) =>
        require('../../controllers/reception-act/request.controller')(Request, DenyDay, Folder, Student,Period,Department, Employee, Position));    

    router.get('/get/all/:clientId', (req, res) =>
        requestCtrl.getAllRequest(req, res));

    router.get('/employee/gender/:email', (req, res) =>
        requestCtrl.getEmployeeGender(req, res));

    router.get('/employee/grade/gender/:email', (req, res) =>
        requestCtrl.getEmployeeGradeAndGender(req, res));
        
    router.get('/periods', (req, res) =>
        requestCtrl.getPeriods(req, res));
        
    router.get('/phase/:phase/:clientId', (req, res) =>
        requestCtrl.getRequestByStatus(req, res));
        
    router.get('/students', (req, res) =>
        requestCtrl.StudentsToSchedule(req, res));

    router.get('/summary', (req, res) =>
        requestCtrl.getSummary(req, res));
                
    router.get('/approved', (req, res) =>
        requestCtrl.getAllRequestApproved(req, res));
        
    router.get('/:_id/file/:resource', (req, res) =>
        requestCtrl.getResource(req, res));
        
    router.get('/:_id/weblink/:resource', (req, res) =>
        requestCtrl.getResourceLink(req, res));

    router.get('/:_id', (req, res) =>
        requestCtrl.getById(req, res));

    router.get('/verify/:_requestId/:_code', (req, res) =>
        requestCtrl.verifyCode(req, res));

    router.get('/sendCode/:_requestId', (req, res) =>
        requestCtrl.sendVerificationCode(req, res));
        
    router.post('/schedule', (req, res) =>
        requestCtrl.groupRequest(req, res));
    
    router.post('/settitled', (req, res) =>
            requestCtrl.completeTitledRequest(req, res));

    router.post('/diary/:clientId', (req, res) =>
        requestCtrl.groupDiary(req, res));

    router.post('/create/:_id', (req, res) => {
            return requestCtrl.create(req, res);
        });

    router.post('/titled', (req, res) => {
            return requestCtrl.createTitled(req, res);
        });
    
    router.post('/:_id/file', (req, res) => {
            requestCtrl.uploadFile(req, res);
        });

    router.post('/period', (req, res) => {
            requestCtrl.period(req, res);
        });
    
    router.post('/:_id/file/omit', (req, res) =>
            requestCtrl.omitFile(req, res));

    router.post('/summary/upload', (req, res) =>
        requestCtrl.uploadSummary(req, res));

    router.put('/:_id', (req, res) => {
            return requestCtrl.correctRequest(req, res);
        });

    router.put('/:_id/status/:role', (req, res) =>
        requestCtrl.updateRequest(req, res));

    router.put('/:_id/integrants', (req, res) =>
        requestCtrl.addIntegrants(req, res));

    router.put('/:_id/released', (req, res) => {
        return requestCtrl.releasedRequest(req, res);
    });

    router.put('/:_id/jury', (req, res) => {
        return requestCtrl.changeJury(req, res);
    });

    router.put('/:_id/file', (req, res) =>
        requestCtrl.fileCheck(req, res));

    router.delete('/:id', (req, res) =>
        requestCtrl.removeTitled(req, res));

    router.put('/statusExamAct/:_idRequest', (req, res) => 
        requestCtrl.createStatusExamAct(req, res));

    router.post('/mailExamAct', (req, res) => {
        requestCtrl.sendMailExamAct(req, res);
    });

    router.put('/changeStatusExamAct/:_idRequest', (req, res) => 
        requestCtrl.changeStatusExamAct(req, res));
    
    return router;
};
