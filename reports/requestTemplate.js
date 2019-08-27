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
            <div style="margin:0px 0px;font-family: 'Helvetica Neue';color:black;font-size:11px;">
                <div>
                    <div style="width:100%;">
                        <div>
                            <div style="font-weight:bold;font-size:11px;" align="center">
                                <label>Registro ITT-POS-02-01</label><br>
                                <label>FORMATO DE SOLICITUD DEL ESTUDIANTE</label><br>
                                <label>PARA LA TITULACIÓN INTEGRAL</label>
                            </div><br>
                            <div style="font-size:11px;" align="right">
                                <u>Tepic, Nayarit, ${moment(request.creationDate).format('LL')}</u>
                            </div><br>
                            <div style="font-weight:bold;font-size:11px;" align="left">
                                <span>C. <u>${request.headProfessionalStudiesDivision}</u></span><br>
                                <span>Jefe(a) de la División de Estudios Profesionales</span><br>
                                <span style="letter-spacing:3px;">PRESENTE</span>
                            </div><br>
                            <div style="font-weight:bold;font-size:11px;" align="right">
                                <span>At´n. <u>${request.degreeCoordinator}</u></span><br>
                                <span>Coordinador(a) de apoyo a Titulación o equivalente</span>
                            </div>
                        </div><br>
                        <div>
                            <div style="font-size:11px;" align="left">
                                <p>Por medio del presente solicito autorización para iniciar trámite de registro del proyecto
                                    de titulación integral:</p>
                            </div>
                            <div>
                                <table style="font-size:11px;border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="2px">
                                    <tr>
                                        <td style="width:130px;">Nombre:</td>
                                        <td>${request.graduate.name.fullName}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">Carrera:</td>
                                        <td>${request.graduate.career}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">No. de control:</td>
                                        <td>${request.graduate.controlNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">Nombre del proyecto:</td>
                                        <td>${request.request.projectName}</td>
                                    </tr>
                                    <tr>
                                        <td style="width:130px;">Producto:</td>
                                        <td>${request.request.product}</td>
                                    </tr>
                                </table>
                            </div>
                            <div style="font-size:11px;" align="left">
                                <p>En espera de la aceptación de esta solicitud, quedo a sus órdenes.</p>
                            </div>
                        </div><br><br><br>
                        <div>
                            <div style="font-weight:bold;font-size:11px;" align="center">
                                <span>ATENTAMENTE</span><br>
                                <u>${request.graduate.name.fullName}</u><br>
                                <span>Nombre y firma del estudiante</span>
                            </div><br><br>
                            <div>
                                <table style="font-size:11px;border:1px solid black;width:100%;border-collapse:collapse" border="1" cellpadding="2px">
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
                </div>
            </div>
            </body>
        </html>
    `;
    return template;
};
