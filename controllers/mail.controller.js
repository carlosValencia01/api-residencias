const status = require('http-status');
const send = require('../utils/sendmail');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve('./templates/', 'inscription.html');

const sendmail = (req, res) => {
    console.log("Sending mail...");
    let { to_email, to_name, subject, sender, name } = req.body;

    fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
        if (!err) {
            const env = {
                to_email: to_email,
                to_name: to_name,
                subject: subject,
                message: data,
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
        } else {
            console.log(err);
            res.status(status.BAD_REQUEST);
            res.json({ code: 400, message: 'Ocurrió un error', detail: err});
        }
    });
};

module.exports = () => {
    return ({
        sendmail
    });
};