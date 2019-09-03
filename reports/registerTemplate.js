const moment = require('moment');
moment.locale('es');

const header = () => {
    return `
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
            </head>
            <body>
            <table style="width:100%;font-family:'Montserrat';display:inline-flex;justify-content:center;font-size:8px;color:darkgray;">
                <tr>
                    <td align="left">
                        <div align="left">
                            <span width="150"></span>
                            <img alt="Secretaría de Educación Pública" width="100" src="/assets/images/educacionsep.png">
                        </div>
                    </td>
                    <td align="right">
                        <div align="right">
                            <img alt="Tecnológico Nacional de México" width="100"  src="http://www.tepic.tecnm.mx/images/Logo%20TecNM.png"><br>
                            <span style="font-weight:bold;font-size:8px;">Instituto Tecnológico de Tepic</span>
                        </div>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

const body = (request) => {
    return `
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
                <img width="150" src="/assets/images/educacionsep.png" style="display:none;">
                <img width="150" src="http://www.tepic.tecnm.mx/images/Logo%20TecNM.png" style="display:none;">
                <img width="150" src="http://www.ittepic.edu.mx/images/escudo_itt_200x200.png" style="display:none;">
            </head>
            <body>
            <div style="margin:0px 0px;font-family:'Montserrat';color:black;font-size:11px;">
                <div>
                    <div style="width:100%;">
                        <div>
                            <div style="font-weight:bold;font-size:11px;" align="center">
                                <label>Registro ITT-POS-02-02</label><br>
                                <label>FORMATO DE REGISTRO DE PROYECTO</label><br>
                                <label>PARA LA TITULACIÓN INTEGRAL</label>
                            </div><br>
                            <div style="font-size:11px;" align="right">
                                <span>Asunto: Registro de proyecto para la titulación integral.</span>
                            </div><br>
                            <div style="font-weight:bold;font-size:11px;" align="left">
                                <span>C. <u>${request.headProfessionalStudiesDivision}</u></span><br>
                                <span>Jefe(a) de la División de Estudios Profesionales</span><br>
                                <span style="letter-spacing:3px;">PRESENTE</span>
                            </div>
                        </div><br>
                        <div>
                            <div style="font-size:11px;" align="left">
                                <div>
                                    <span>Departamento de: <u>Nombre departamento</u></span><br>
                                    <div style="width:100%;display:inline-table;">
                                        <span style="display:table-cell;text-align:left;">Lugar: <u>Tepic, Nayarit </u></span>&nbsp;&nbsp;
                                        <span style="display:table-cell;text-align:right;">Fecha: <u>${moment(new Date()).format('LL')}</u></span>
                                    </div>
                                </div>
                            </div><br>
                            <div>
                                <table style="font-size:11px;border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="2px">
                                    <tr>
                                        <td style="width:130px;">Nombre del proyecto:</td>
                                        <td>${request.request.projectName}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">Nombre(s) del (de los) asesor(es):</td>
                                        <td>Asesor(es)</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">Número de estudiantes:</td>
                                        <td>${request.request.numberParticipants}</td>
                                    </tr>
                                </table>
                            </div><br>
                            <div style="font-size:11px;" align="left">
                                <span>Datos del (de los) estudiante(s):</span>
                                <table style="font-size:11px;border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="2px">
                                     <tr>
                                        <td>Nombre</td>
                                        <td>No. de control</td>
                                        <td>Carrera</td>
                                    </tr>
                                    <tr>
                                        <td>${request.graduate.name.fullName}</td>
                                        <td>${request.graduate.controlNumber}</td>
                                        <td>${request.graduate.career}</td>
                                    </tr>
                                    <tr>
                                        <td>${request.graduate.name.fullName}</td>
                                        <td>${request.graduate.controlNumber}</td>
                                        <td>${request.graduate.career}</td>
                                    </tr>
                                </table>
                            </div><br>
                            <div style="border: 1px solid black;padding:5px;">
                                <span>Observaciones:</span><br>
                                <span>${request.observations ? request.observations : ''}</span>
                            </div>
                        </div><br>
                        <div>
                            <div style="font-weight:bold;font-size:11px;" align="center">
                                <span>ATENTAMENTE</span><br><br><br><br>
                                <u>Jefe departamento</u><br>
                                <span>Nombre y firma del (de la) Jefe(a) de Departamento Académico</span>
                            </div><br><br>
                        </div>
                    </div>
                </div>
            </div>
            </body>
        </html>
    `;
};

const footer = () => {
    return  `
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
            </head>
            <body>
                <table style="width:100%;font-family:'Montserrat';display:inline-flex;justify-content:center;font-size:8px;color:gray;">
                    <tr>
                        <td>
                            <div align="left">
                                <img alt="ITT" height="35" src="http://www.ittepic.edu.mx/images/escudo_itt_200x200.png">
                            </div>
                        </td>
                        <td>
                            <div style="font-family:'Montserrat';margin:0px 10px;" align="center">
                                <span>Av. Tecnológico # 2595, Col. Lagos del Country. C.P. 63175</span><br>
                                <span>Tepic, Nayarit, México. Tel: (311) 211 94 00 y 2 11 94 01. info@ittepic.edu.mx</span><br>
                                <b>https://www.tecnm.mx/</b> | <b>http://www.tepic.tecnm.mx/</b>
                            </div>
                        </td>
                    </tr>
                </table>
        </body>
        </html>
    `;
};

module.exports = () => {
    return ({
        header,
        body,
        footer,
    });
};
