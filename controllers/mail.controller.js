const status = require('http-status');
const send = require('../utils/sendmail');
const fs = require('fs');
const path = require('path');

let _inscription;

const sendInscriptionMail = (req, res) => {
    console.log("Sending mail...");
    const filePath = path.resolve('./templates/', 'inscription.html');

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
        if (!err) {
            req.body.message= data;
            saveEmail(req, res);
            return sendMail(req, res);
        } else {
            console.log(err);
            res.status(status.BAD_REQUEST);
            res.json({ code: 400, message: 'Ocurrió un error', detail: err});
        }
    });
};

const sendOtherMail= (req, res) => {
    req.body.message= "hola";
    return sendMail(req, res);
}

const sendMail= (req, res) => {
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
            return res.json({ status: status.BAD_REQUEST, errorCode: data.code });
        }

        console.log(data);

        res.status(status.OK);
        res.json({ code: 200, message: 'Email enviado correctamente', detail: 'OK' });
    });
}

const saveEmail= (req, res)=>{
    _inscription.create({email:req.body.to_email}).then(saved=>{
        res.json(saved);
    }).catch(err=>{
        res.status(status.INTERNAL_SERVER_ERROR).json({
            error: err.toString()
        });
    });
}

module.exports = (Inscription) => {
    _inscription= Inscription;
    return ({
        sendInscriptionMail,
        sendOtherMail
    });
};
