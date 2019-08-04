const status = require('http-status');
const fs = require('fs');
const path = require('path');
const util= require('util');
const send = require('../utils/sendmail');

const readFile = util.promisify(fs.readFile);

let _inscription;

const sendMail= (req, res, callback)=>{
    let { to_email, to_name, subject, sender, name, message} = req.body;

    const env = {
        to_email: to_email,
        to_name: to_name,
        subject: subject,
        message: message,
        type: "text/html",
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

const sendInscriptionMail = (req, res) => {
    console.log("Sending mail...");
    const filePath = path.resolve('./templates/', 'inscription.html');

    readFile(filePath, {encoding: 'utf-8'}).then(data=>{
        req.body.message= data;
        req.body.subject= "Proceso de inscripción";

        sendmail(req, res).then(()=>{
            saveEmail(req.body.to_email)
        }).catch(err=>{
            res.status(status.BAD_REQUEST);
            res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
        });
    }).catch(err=>{
        console.log(err);
        res.status(status.BAD_REQUEST);
        res.json({ code: 400, message: 'Ocurrió un error al buscar la plantilla', detail: err});
    });
};

const saveEmail= (email)=>{
    _inscription.create({email:email}).then(()=>{
        return true;
    }).catch(()=>{
        return false;
    });
}

module.exports = (Inscription) => {
    _inscription= Inscription;
    return ({
        sendInscriptionMail,
    });
};
