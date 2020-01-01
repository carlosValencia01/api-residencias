const helper = require('sendgrid').mail;
const config = require('../_config');
const sg = require('sendgrid')(config.SENDGRID_APIKEY);

module.exports.send = (params, done) => {
    let { to_email, to_name, subject, message, type, sender } = params;

    const from = sender;
    const content = new helper.Content(type, message);
    const from_email = new helper.Email(from);
    let mail = new helper.Mail();
    let personalization = new helper.Personalization();
    mail.addContent(content);
    for (const email of to_email) {
        personalization.addTo(new helper.Email(email, to_name));
    }
    mail.addPersonalization(personalization);
    mail.setFrom(from_email);
    mail.setSubject(subject);
    const request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
        let res2 = {};

        res2.code = response.statusCode;
        switch (res2.code) {
            case 202:
                res2.message = 'Mensaje enviado';
                res2.detail = 'OK';
                break;
            case 400:
                let message = response.body.errors[0].message.toString();
                message = message.replace('Each email address in the personalization block should be unique between to, cc, and bcc. We found the first duplicate instance of ',
                    'Cada correo tiene que ser unico, parece que ');
                message = message.replace('in the personalizations.\d./',
                    'esta duplicado.');
                message = message.replace('to field.', '');
                message = message.replace('The to array is required for all personalization objects, and must have at least one email object with a valid email address.',
                    'Parece que no ingresaste un correo al cual enviarle el mensaje.');
                message = message.replace('The personalization block is limited to 1000 personalizations per API request.',
                    'Solo se pueden agregar 1000 destinos de correo.');
                message = message.replace('You have provided ',
                    'Estas intentando enviar ');
                message = message.replace(' personalizations. Please consider splitting this into multiple requests and resending your request.',
                    ' correos, por favor hazlo en diversas peticiones.');
                res2.message = message;
                res2.detail = 'BAD REQUEST';
                break;
            case 401:
                res2.message = 'No tienes autorización para realizar la solicitud.';
                res2.detail = 'UNAUTHORIZED';
                break;
            case 403:
                res2.message = 'Hubo un problema con la solicitud';
                res2.detail = 'FORBIDDEN';
                break;
            case 404:
                res2.message = 'El recurso solicitado no existe o no pudó ser encontrado';
                res2.detail = 'NOT FOUND';
                break;
            case 405:
                res2.message = 'Hubo un problema con la solicitud';
                res2.detail = 'METHOD NOT ALLOWED';
                break;
            case 415:
                res2.message = 'Hubo un problema con la solicitud';
                res2.detail = 'UNSUPPORTED MEDIA TYPE';
                break;
            case 429:
                res2.message = 'Demasiadas solicitudes, por favor contacta al administrador.';
                res2.detail = 'TOO MANY REQUESTS';
                break;
            case 500:
                res2.message = 'Un error ocurrio en el servidor de SendGrid';
                res2.detail = 'SERVER UNAVAILABLE';
                break;
            case 503:
                res2.message = 'La API Web de SendGrid no esta disponible.';
                res2.detail = 'SERVICE NOT AVAILABLE';
                break;
            default:
                res2.message = 'La API Web de SendGrid no esta disponible.';
                res2.detail = 'SERVICE NOT AVAILABLE';
        }
        done(res2);
    });
}