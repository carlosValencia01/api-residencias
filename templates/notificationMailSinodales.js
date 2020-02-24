module.exports = (SUBTITULO,MENSAJE) => {
    const template = `
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            </head>
            <body style="-webkit-text-size-adjust: none; box-sizing: border-box; color:rgb(60,0,64); font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6">
                <style type="text/css">
                    body {
                        width: 100% !important;
                        height: 100%;
                        margin: 0;
                        line-height: 1.4;
                        background-color: #F2F4F6;
                        -webkit-text-size-adjust: none;
                    }
                    @media only screen and (max-width: 600px) {
                        .email-body_inner {
                            width: 100% !important;
                        }

                        .email-footer {
                            width: 100% !important;
                        }
                    }
                    @media only screen and (max-width: 500px) {
                        .button {
                            width: 100% !important;
                        }
                    }
                </style>
                <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#FFFFFF">
                    <tr>
                        <td align="center" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
                            <div style="text-align:center;">
                                <img src="https://i.ibb.co/6n3yvgX/image.png" width="85%">
                            </div>
                            <div style="width:700px; padding:20px;border-radius:10px ;margin-right:50px; margin-left:50px;background: linear-gradient(to bottom right,rgb(27,45,105),rgb(28, 40, 148));">
                                <div style="margin: 20px; padding:10px; background: #F7F7F7; border-radius:10px;">
                                    <div style="font-size:30px; text-align:center">
                                        <b>
                                            <p>Acto Recepcional</p>
                                        </b>
                                    </div>
                                    <hr style="height:2px; background:black">
                                    <div style="font-size:19px; text-align:center">
                                        <p><b>${SUBTITULO}</b></p>
                                    </div>
                                    <div style="font-size:15px;">
                                        <p>${MENSAJE}</p>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align:center; font-size:15px">
                                <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">
                                    <img src="https://i.ibb.co/SNKJBRf/logo-Tec45.png" width="75px">
                                </p>
                                <p class="sub align-center" style="box-sizing: border-box;  color : #828282; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">
                                    © ITT Instituto Tecnológico de Tepic<br>
                                    Tepic, Nayarit, México<br>
                                    Dudas o mayor información al teléfono (311) 211 9400 ext. 317, 430 y 307
                                </p>
                                <p class="sub align-center" style="box-sizing: border-box;; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">
                                    Email enviado automáticamente<br>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
        </html>`;
    return template;
  }