const async= require('async');
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
            console.log(data);
            return res.json({ status: status.BAD_REQUEST, errorCode: data.code, code: data.code});
        }
        console.log(data);

        res.status(status.OK);
        res.json({ code: 200, message: 'Email enviado correctamente', detail: 'OK' });
    });
    callback();
};

const sendmail= util.promisify(sendMail);

const sendTemplateMail= (req, res)=>{
    const template= chooseTemplate(req.body.index);

    const filePath = path.resolve('./templates/', template.file);

    readFile(filePath, {encoding: 'utf-8'}).then(data=>{
        req.body.sender= template.sender;
        req.body.subject= template.subject;
        req.body.message= data;

        if(req.body.many){
            getAllMailsFromDb().then(async (allEmails)=>{
                for(const emails of allEmails){
                    req.body.to_email= emails;
                    await sendmail(req, res).then(()=>{
                    }).catch(err=>{
                        res.json({ code: 400, message: 'Ocurrió un error al enviar el email', detail: err});
                        res.status(status.BAD_REQUEST);
                    });
                }
            }).catch(err=>{
                res.json({ code: 400, message: 'Ocurrió un error al buscar los emails en la db', detail: err});
                res.status(status.BAD_REQUEST);
            });
        }else{
            sendmail(req, res).then(()=>{
                if(req.body.index===0){
                    saveEmail(req.body.to_email);
                }
            }).catch(err=>{

            });
        }
    }).catch(err=>{

    });
};

const saveEmail= (email)=>{
    _inscription.create({email:email[0]}).then(()=>{
        return true;
    }).catch(()=>{
        return false;
    });
};

const getAllMailsFromDb= ()=>{
    return new Promise((resolve, reject)=> {
        _inscription.distinct("email").then(data => {
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
            }
            resolve(allEmails);
        }).catch(err => {
            reject(err);
        });
    });
};

const chooseTemplate= (index)=>{
    switch(index){
        case 0:
            return {
                file:"inscription.html",
                sender:"escolares_05@ittepic.edu.mx",
                subject:"Proceso de inscripción"
            };
            break;
        case 1:
            return {
                file:"english.html",
                sender:"coordinacion.le@ittepic.edu.mx",
                subject:"Promoción de cursos de inglés"
            };
            break;
        case 2:
            return {
                file:"credentials.html",
                sender:"escolares_05@ittepic.edu.mx",
                subject:"Tómate la foto para tu credencial"
            };
            break;
    }
}

module.exports = (Inscription) => {
    _inscription= Inscription;
    return ({
        sendTemplateMail
    });
};
