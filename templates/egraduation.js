module.exports = (ID,NOMBRE) => {
  const template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//ES" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"> 
    <head> 
      <meta name="viewport" content="width=device-width, initial-scale=1.0" /> 
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
       
       
    </head> 
    <body style="-webkit-text-size-adjust: none; box-sizing: border-box; ; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"><style type="text/css"> 
  body { 
  width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; -webkit-text-size-adjust: none; 
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
        <div style="padding:20px;border-radius:20px ;margin-right:50px; margin-left:50px;background: linear-gradient(to bottom right,#212F8C,#2A359A);">
          <div style="text-align:center;">
          <img src="https://i.ibb.co/6n3yvgX/image.png" width="85%" height="50%">
          </div>
          <div style="margin: 20px; padding:10px; background: #F7F7F7; border-radius:20px;">
              <div style="font-size:30px; text-align:center">
                  <b>
                      <p>"CEREMONIA DE GRADUACIÓN"</p>
                  </b>
              </div>
              <hr style="height:2px; background:black">
              <div style="font-size:19px; text-align:center">
                  <p>Estimado<br><b>${NOMBRE}</b></p>
              </div>
              <div style="font-size:15px;">
                  <p>Te felicitamos por llegar a esta etapa tan importante para tu vida. TE RECORDAMOS QUE PARTICIPES EL DIA <b>3 DE OCTUBRE A LAS 8:00 A.M. EN LA FOTO OFICIAL DE GENERACIÓN OCTUBRE 2019</b>, ASÍ MISMO INVITARTE A PARTICIPAR EN EL ENSAYO GENERAL QUE SE LLEVARÁ A CABO EN LAS INSTALACIONES DEL TEATRO DEL PUEBLO EL DÍA <b>4 DE OCTUBRE A LAS 9:00 A.M.</b> Este evento es trascendental. Asimismo, te invitamos a CONTINUAR cerrando el ciclo académico con el proceso de Titulación y te conviertas en LICENCIADO, ARQUITECTO O INGENIERO.</p>
              </div>
              <hr style="height:2px; background:black">
              <div style="font-size:20px;">
                  <p>A continuación se anexa el <b>Código QR</b> para registrar su asistencia:</p>
              </div>

              <div style="text-align:center">
                <img src="https://chart.googleapis.com/chart?chs=450x450&cht=qr&chl=${ID}&choe=UTF-8">
              </div>
              <div style="font-size:19px; text-align:center">
                <p><b>Hora de ingreso 5:00 p.m - 5:30 p.m.</b></p>
              </div>
              <hr style="height:2px; background:black">

              <div style="text-align:center">
                <p><i>Atentamente:</i><br>
                <i><b>Departamento de Comunicación y Difusión</b></i><br>Tel: (311) 211-94-00 Ext: 327</p>
              </div>
          </div>
          <div style="text-align:center; font-size:15px"><img
          <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center"> 
          <img src="https://www.sittepic.tech/sit_pruebas/img/escudo_itt.png" width="64px"> 
          </p> 
          <p class="sub align-center" style="box-sizing: border-box; color: #FFFFFF; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">© ITT Instituto Tecnológico de Tepic</p> 
          <p class="sub align-center" style="box-sizing: border-box; color: #FFFFFF; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">Email enviado automáticamente<br>Tepic, Nayarit, México</p> 
          </div>
        </div>
      </td> 
    </tr> 
  </table> 
  </body> 
  </html> `;
  return template;
}