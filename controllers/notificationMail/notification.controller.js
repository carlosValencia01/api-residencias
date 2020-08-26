const status = require('http-status');
const util= require('util');
const send = require('../../utils/sendmail');
const sendMail = require('../shared/mail.controller');

// Enviar QR
const sendNotificationMail = (req, res, callback)=>{
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

const sendnotificationmail = util.promisify(sendNotificationMail);

const sendNotification = (req, res) => {
    console.log(req.body);
    let titulo = req.body.title;
    let nombre = req.body.name;
    let mensaje = req.body.message;
    let asunto = req.body.subject;
    let remitente = req.body.sender;

    let message = require('../../templates/notificationMail')(titulo,nombre,mensaje)
    req.body.message= message;
    req.body.subject= asunto;
    req.body.sender= remitente;

    console.log('Correo enviado a: '+nombre);

    sendnotificationmail(req, res).catch(err=>{
        res.status(status.BAD_REQUEST);
        res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
    });
};
/**
 * Enviar email con plantilla generica
 * @param {*} email a quien va dirigido
 * @param {*} sender quien lo envia
 * @param {*} subject asunto
 * @param {*} header debe contener las propiedades titulo y subtitulo
 * @param {*} body cuerpo en html si se requiere
 * @param {*} contact_ext si se quiere agregar una extension al teléfono del tec, ej. 'ext. 317, 430 y 307'
 */
const sendGenericNotification = (email,sender,subject,header={title:'',subtitle:''},body,contact_ext='') =>{

    return new Promise(resolve => {
        let message = require('../../templates/genericMail.template')(header,body,contact_ext);
        const emailData = {
            to_email: [email],
            subject,
            sender,
            message
        };
        sendMail({ body: emailData })
            .then(data => resolve(data));
    });
}

module.exports = () => {
    return ({
        sendNotification,
        sendGenericNotification,
    });
};
