const status = require('http-status');
const fs = require('fs');
const path = require('path');
const util = require('util');
const sendMail = require('../shared/mail.controller');
const mailTemplate = require('../../templates/inscription');

const readFile = util.promisify(fs.readFile);
let _inscription;

const sendTemplateMail = async (req, res) => {
    const template = chooseTemplate(req.body.index);
    const filePath = path.resolve('./templates/', template.file);

    readFile(filePath, {encoding: 'utf-8'}).then(data => {
        req.body.sender = template.sender;
        req.body.subject = template.subject;
        req.body.message = data;

        if (req.body.many) {
            getAllMailsFromDb().then(allEmails => {
                asyncFor(req, res, allEmails);
            }).catch(err => {
                res.json({code: 400, message: 'Ocurrió un error al buscar los emails en la db', status: status.BAD_REQUEST, detail: err});
            });
        } else if (req.body.to_email.length > 1) {
            let flag = false;
            const allEmails = separateEmails(req.body.to_email);

            if (req.body.index === 1) {
                flag = true;
            }
            asyncFor(req, res, allEmails, flag);
        } else {
            sendMail(req).then(async data => {
                if (req.body.index === 1) {
                    await saveEmails(req.body.to_email);
                }
                data.code = 200;
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }
    }).catch(err => {
        res.json({code: 400, message: 'Error al buscar el template', status: status.BAD_REQUEST, detail: err});
    });
};

const asyncFor = async (req, res, allEmails, save = false) => {
    let messages = [];
    let allFailedEmails = [];

    for (let i = 0; i < allEmails.length; i++) {
        req.body.to_email = allEmails[i];

        await sendMail(req, res).then(async data => {
            if (save) {
                if (data.code === 202) {
                    await saveEmails(allEmails[i]);
                }
            }
            messages.push(data);

            if (data.code !== 202) {
                allFailedEmails = allFailedEmails.concat(allEmails[i]);
            }

            if (i === (allEmails.length - 1)) {
                for (const message of messages) {
                    if (message.code !== 202) {
                        return res.json({code: message.code, emails: allFailedEmails});
                    }
                }
                return res.json({code: 200, message: "Emails enviados correctamente", status: status.OK, detail: 'OK'});
            }
        }).catch(err => {
            console.log(err);
        });
    }
};

const saveEmails = async emails => {
    let newAllEmails = [];
    for (const email of emails) {
        const newEmails = {
            email: email,
        };
        newAllEmails.push(newEmails);
    }

    return new Promise((resolve, reject) => {
        _inscription.create(newAllEmails).then(_ => {
            resolve(true);
        }).catch(_ => {
            if (_.code === 11000) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    });
};

const getAllMailsFromDb = _ => {
    return new Promise((resolve, reject) => {
        _inscription.distinct('email').then(data => {
            const allEmails = separateEmails(data);

            resolve(allEmails);
        }).catch(err => {
            reject(err);
        });
    });
};

const separateEmails = data => {
    const length = data.length;
    const iterations = Math.floor((length - 1) / 1000);
    const res = (length % 1000);
    let ini = 0;
    let end = 1000;
    let allEmails = [];
    let arr = [];

    for (let i = 0; i <= iterations; i++) {
        if (i == iterations) {
            end = ini + res;
        }
        arr = data.slice(ini, end);
        ini = end;
        end += 1000;
        allEmails.push(arr);
        return allEmails;
    }
};

const chooseTemplate = index => {
    switch (index) {
        case 1:
            return {
                file: 'inscription.html',
                sender: 'Servicios escolares <escolares_05@ittepic.edu.mx>',
                subject: 'Proceso de inscripción'
            };
        case 2:
            return {
                file: 'english.html',
                sender: 'Centro de idiomas <coordinacion.le@ittepic.edu.mx>',
                subject: 'Promoción de cursos de inglés'
            };
        case 3:
            return {
                file: 'credentials.html',
                sender: 'Servicios escolares <escolares_05@ittepic.edu.mx>',
                subject: 'Tómate la foto para tu credencial'
            };
    }
};

const _sendEmail = ({ email, subject, sender, message }) => {
    return new Promise(resolve => {
        const emailData = {
            to_email: [email],
            subject: subject,
            sender: sender,
            message: message
        };
        sendMail({ body: emailData })
            .then(data => resolve(data));
    });
};

const sendInscriptionMail = async (req, res) => {
    let students = req.body;
    for(let i = 0; i < students.length; i++){
        const _email = students[i].personalEmail;
        const nombre = students[i].name;
        const nc = students[i].controlNumber;
        const nip = students[i].nip;
        const email = _email;
        const subject = 'Inscripciones - ITTEPIC'; //MODIFICAR
        const sender = 'Servicios escolares <escolares_05@ittepic.edu.mx>';
        const message = mailTemplate(nombre, nc, nip);
        await _sendEmail({ email: email, subject: subject, sender: sender, message: message })
        .then(async data => {
            console.log("Correo enviado a: "+students[i].personalEmail);
        });
    }
    res.status(status.OK).json({ message: 'Correos envíados con éxito' })
    
};

module.exports = Inscription => {
    _inscription = Inscription;
    return ({
        sendTemplateMail,
        sendInscriptionMail
    });
};
