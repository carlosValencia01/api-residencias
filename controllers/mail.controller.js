const status = require('http-status');
const fs = require('fs');
const path = require('path');
const util= require('util');
const send = require('../utils/sendmail');

const sendmail = (req, res) => {
    console.log("Sending mail...");
    let { to_email, to_name, subject, sender, name } = req.body;

    const env = {
        to_email: to_email,
        to_name: to_name,
        subject: subject,
        message: template_etitulos(name),
        type: "text/html",
        sender: sender
    };
    send.send(env, function (data) {
        if (data.code !== 202) {
            res.status(status.BAD_REQUEST);
            return res.json({ status: status.BAD_REQUEST, errorCode: data.code });
        }
        res.status(status.OK);
        res.json({ code: 200, message: 'Email enviado correctamente', detail: 'OK' });
    });
};

module.exports = () => {
    return ({
        sendmail
    });
};
