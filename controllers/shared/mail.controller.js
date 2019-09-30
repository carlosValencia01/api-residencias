const status = require('http-status');
const send = require('../../utils/sendmail');

const sendMail = req => {
    return new Promise(resolve => {
        let { to_email, to_name, subject, sender, name, message } = req.body;

        const env = {
            to_email: to_email,
            to_name: to_name,
            subject: subject,
            message: message,
            type: "text/html",
            sender: sender
        };

        send.send(env, function (data) {
            if (data.code !== 202) {
                resolve({
                    code: data.code,
                    message: data.message,
                    status: status.BAD_REQUEST,
                    detail: data.detail
                });
            } else {
                resolve({
                    code: data.code,
                    message: data.message,
                    status: status.OK,
                    detail: data.detail
                });
            }
        });
    });
};

module.exports = sendMail;