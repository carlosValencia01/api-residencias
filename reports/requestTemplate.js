const moment = require('moment');
moment.locale('es');

module.exports = function(request) {
    let template = `
        <html lang="es">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
            </head>
            <body>
            <div style="max-width:216mm;max-height:279mm;margin:0px 0px;font-family: 'Helvetica Neue';color: #555;">
                <div style="padding:5mm 20mm 10mm 25mm;">
                    <header style="width:100%;display:inline-flex;float:top;">
                        <div style="width:50%;padding: 10px 30px;" align="left">
                            <img alt="Secretaría de Educación Pública" width="150" src="http://www.tepic.tecnm.mx/images/sepfooter.png">
                        </div>
                        <div style="width:50%;padding: 10px 30px;" align="right">
                            <img alt="Tecnológico Nacional de México" width="150" src="http://www.tepic.tecnm.mx/images/Logo%20TecNM.png"><br>
                            <span style="color: gray;font-weight:bold;font-size:14px;">Instituto Tecnológico de Tepic</span>
                        </div>
                    </header>
                    <br><br>
                    <div style="width:100%;">
                        <div>
                            <div style="font-weight:bold;font-size:16px;" align="center">
                                <label>Registro ITT-POS-02-01</label><br>
                                <label>FORMATO DE SOLICITUD DEL ESTUDIANTE</label><br>
                                <label>PARA LA TITULACIÓN INTEGRAL</label>
                            </div><br>
                            <div style="font-size:16px;" align="right">
                                <span>Lugar y fecha: <u>Tepic, Nayarit, ${moment(request.creationDate).format('LL')}</u></span>
                            </div><br>
                            <div style="font-weight:bold;font-size:16px;" align="left">
                                <span>C. <u>${request.headProfessionalStudiesDivision}</u></span><br>
                                <span>Jefe(a) de la División de Estudios Profesionales o su equivalente en los Institutos</span><br>
                                <span>Tecnológicos Descentralizados</span><br>
                                <span>PRESENTE</span>
                            </div><br>
                            <div style="font-weight:bold;font-size:16px;" align="right">
                                <span>At´n. <u>${request.degreeCoordinator}</u></span><br>
                                <span>Coordinador(a) de apoyo a Titulación o</span><br>
                                <span>su equivalente en los Institutos Tecnológicos Descentralizados</span>
                            </div>
                        </div><br>
                        <div>
                            <div style="font-size:16px;" align="left">
                                <p>Por medio del presente solicito autorización para iniciar trámite de registro del proyecto
                                    de titulación integral:</p>
                            </div>
                            <div>
                                <table style="border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="1px">
                                    <tr>
                                        <td style="width:150px;">Nombre:</td>
                                        <td>${request.graduate.name.fullName}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">Carrera:</td>
                                        <td>${request.graduate.career}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">No. de control:</td>
                                        <td>${request.graduate.controlNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">Nombre del proyecto:</td>
                                        <td>${request.request.projectName}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">Producto:</td>
                                        <td>${request.request.product}</td>
                                    </tr>
                                </table>
                            </div><br>
                            <div style="font-size:16px;" align="left">
                                <p>En espera de la aceptación de esta solicitud, quedo a sus órdenes.</p>
                            </div>
                        </div><br><br>
                        <div>
                            <div style="font-weight:bold;font-size:16px;" align="center">
                                <span>ATENTAMENTE</span><br>
                                <u>${request.graduate.name.fullName}</u><br>
                                <span>Nombre y firma del estudiante</span>
                            </div><br><br>
                            <div>
                                <table style="border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="1px">
                                    <tr>
                                        <td style="width:150px;">Dirección:</td>
                                        <td style="width:150px;">${request.graduate.address}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">Telefóno particular o de contacto:</td>
                                        <td style="width:150px;">${request.telephoneContact}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:150px;">Correo electrónico del estudiante:</td>
                                        <td style="width:150px;">${request.graduate.email}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <br><br>
                    <footer style="width:100%;display:inline-flex;justify-content:center;font-size:12px;color:gray;float:bottom;">
                        <div style="width:20%;" align="left">
                            <img alt="" height="40" src="http://www.ittepic.edu.mx/images/escudo_itt_200x200.png">
                        </div>
                        <div style="width:60%;" align="center">
                            <span>Av. Tecnológico # 2595, Col. Lagos del Country. C.P. 63175</span><br>
                            <span>Tepic, Nayarit, México. Tel: (311) 211 94 00 y 2 11 94 01. info@ittepic.edu.mx</span><br>
                            <b>https://www.tecnm.mx/</b> | <b>http://www.tepic.tecnm.mx/</b>
                        </div>
                        <div style="width:20%;" align="right">
                            <img alt="" height="40" src="http://www.ittepic.edu.mx/images/escudo_itt_200x200.png">
                        </div>
                    </footer>
                </div>
            </div>
            </body>
        </html>
    `;
    return template;
};
