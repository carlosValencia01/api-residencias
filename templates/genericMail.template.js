module.exports = (header, body, contact_ext) => {
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
          <div style="border-radius:15px ;background: linear-gradient(to bottom right,#212F8C,#2A359A);">
            <div style="text-align:center;">
            <img src="https://i.ibb.co/6n3yvgX/image.png" width="85%" height="50%">
            </div>
            <div style="margin: 8px; padding:5px; background: #F7F7F7; border-radius:20px;">
              <div class="body-message">
                  <div class="body-message-header">                                        
                      <div style="text-align: center; font-size: 16pt; font-weight:600;">
                            ${header.title}
                          
                      </div>                    
                      <div style="text-align: center; font-size: 13pt;
                      color: #4f4f4f; font-weight:600;">
                            ${header.subtitle}
                      </div>                    
                  </div>
                  <hr style="height:2px; background:#4f4f4f">
                  <div class="body-message-content" style="padding:1em; width:85%;">                    
                        ${body}                     
                  </div>
              </div>
            </div>
            <div style="text-align:center; font-size:15px">
            <p class="sub align-center" style="margin:0;box-sizing: border-box; color: #AEAEAE; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em;" align="center"> 
            <img src="http://www.tepic.tecnm.mx/images/itt_escudo.png" width="64px"> 
            </p> 
            <p class="sub align-center" style="margin:0;box-sizing: border-box; color: #FFFFFF; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em;" align="center">© ITT Instituto Tecnológico de Tepic</p> 
            <p class="sub align-center" style="margin:0;box-sizing: border-box; color: #FFFFFF; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em;" align="center">Email enviado automáticamente<br>Tepic, Nayarit, México</p> 
            <p class="sub align-center" style="margin:0;box-sizing: border-box; color: #FFFFFF; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; padding:5px;" align="center">Dudas o mayor información al teléfono (311) 211 9400 ${contact_ext}</p>
            </div>
          </div>
        </td> 
      </tr> 
    </table> 
    </body> 
    </html>`;
    return template;
};