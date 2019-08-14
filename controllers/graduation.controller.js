const status = require('http-status');
const util= require('util');
const send = require('../utils/sendmail');


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

const sendGraduationMail = (req, res) => {
    const {id} = req.body;
    console.log(req.body);
    
    let message = require('../templates/egraduation')(id)
    console.log(message);  
    req.body.message= message;
    req.body.subject= "Ceremonia de graduación";

    sendmail(req, res).catch(err=>{
        res.status(status.BAD_REQUEST);
        res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
    });
};

module.exports = (Inscription) => {
    _inscription= Inscription;
    return ({
        sendGraduationMail,
    });
};
