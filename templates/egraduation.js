module.exports = (ID) => {
    const template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//ES" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml"> 
      <head> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0" /> 
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
         
         
      </head> 
      <body style="-webkit-text-size-adjust: none; box-sizing: border-box; color: #74787E; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#F2F4F6"><style type="text/css"> 
    body { 
    width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #F2F4F6; color: #74787E; -webkit-text-size-adjust: none; 
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
     
        <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#F2F4F6"> 
          <tr> 
            <td align="center" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;"> 
              <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;"> 
                <tr> 
                  <td class="email-masthead" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> 
                    
                      <img src='https://www.sittepic.tech/sit_pruebas/img/encabezado_2018.png' style='width: 100%'>
            
                  </td> 
                </tr> 
                 
                <tr> 
                  <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #EDEFF2; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> 
                    <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> 
                       
                      <tr> 
                        <td class="content-cell" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;"> 
                          <h1 style="box-sizing: border-box; color: #2F3133; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 19px; font-weight: bold; margin-top: 0;padding: 10px;background-color: #577F9B; color:white;text-align: center;" align="left">CEREMONIA DE GRADUACIÓN</h1> 
                          <p style="box-sizing: border-box; color: #74787E; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;padding: 10px;background-color: #577F9B; color:white;text-align: center;" align="left">A CONTINUACIÓN SE ANEXA EL CODIGO QR PARA PASE DE LISTA</p> 
                           
                          <div style="border: 1px solid #505050;">
                            <img src="https://chart.googleapis.com/chart?chs=450x450&cht=qr&chl=${ID}&choe=UTF-8" >
                          </div>
     
     
                  </td> 
                </tr> 
                <tr> 
                  <td style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;"> 
                    <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> 
                      <tr> 
                        <td class="content-cell" align="center" style="box-sizing: border-box; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;"> 
                          <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">© 2019 Instituto Tecnologico de Tepic</p> 
                          <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center"> 
                            <img src="https://www.sittepic.tech/sit_pruebas/img/escudo_itt.png" width="64px"> 
                          </p> 
                        </td> 
                      </tr> 
                    </table> 
                  </td> 
                </tr> 
              </table> 
            </td> 
          </tr> 
        </table> 
      </body> 
    </html> `;
    return template;
 }