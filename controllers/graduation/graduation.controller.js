const status = require('http-status');
const util= require('util');
const send = require('../../utils/sendmail');

// Enviar QR
const sendMail= (req, res, callback)=>{
    let { to_email, to_name, subject, sender, message} = req.body;

    const env = {
        to_email: to_email,
        to_name: to_name,
        subject: subject,
        message: message,
        type: 'text/html',
        sender: sender
    }

    send.send(env, function (data) {
        if (data.code !== 202) {
            res.status(status.BAD_REQUEST);
            return res.json({ status: status.BAD_REQUEST, errorCode: data.code, code: data.code});
        }
        console.log(data);

        res.status(status.OK);
        res.json({ code: 200, message: 'Email enviado correctamente', detail: 'OK' });
    });
    callback();
};

const sendmail= util.promisify(sendMail);

const sendGraduationMail = (req, res) => {
    const {id} = req.body;
    let nombre = req.body.name;
    
    let message = require('../../templates/egraduation')(id,nombre)
    req.body.message= message;
    req.body.subject= 'Ceremonia de graduación';
    req.body.sender= 'Comunicación y Difusión <comunicacion@ittepic.edu.mx>'

    console.log('Correo enviado a: '+nombre);

    sendmail(req, res).catch(err=>{
        res.status(status.BAD_REQUEST);
        res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
    });
};

// Enviar Encuesta Egresados
const sendMailSurvey= (req, res, callback)=>{
    let { to_email, to_name, subject, sender, message} = req.body;

    const env = {
        to_email: to_email,
        to_name: to_name,
        subject: subject,
        message: message,
        type: 'text/html',
        sender: sender
    }

    send.send(env, function (data) {
        if (data.code !== 202) {
            res.status(status.BAD_REQUEST);
            return res.json({ status: status.BAD_REQUEST, errorCode: data.code, code: data.code});
        }
        console.log(data);

        res.status(status.OK);
        res.json({ code: 200, message: 'Email enviado correctamente', detail: 'OK' });
    });
    callback();
};

const sendmailsurvey= util.promisify(sendMailSurvey);

const sendGraduationMailSurvey = (req, res) => {
    const {id} = req.body;
    let nombre = req.body.name;
    let nc = req.body.nc;
    let carrera = req.body.carreer
    
    let message = require('../../templates/surveyGraduates')(id,nombre,nc,carrera)
    req.body.message= message;
    req.body.subject= 'Encuesta Egresados';
    req.body.sender= 'Comunicación y Difusión <comunicacion@ittepic.edu.mx>'

    console.log('Correo enviado a: '+nombre);

    sendmailsurvey(req, res).catch(err=>{
        res.status(status.BAD_REQUEST);
        res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
    });
};

module.exports = () => {
    return ({
        sendGraduationMail,
        sendGraduationMailSurvey,
    });
};
