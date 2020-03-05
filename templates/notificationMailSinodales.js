module.exports = (SUBTITULO,MENSAJE) => {
    const template = `
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
       <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <style type="text/css">
          #outlook a {
             padding: 0;
          }
 
          body {
             width: 100% !important;
             -webkit-text-size-adjust: 100%;
             -ms-text-size-adjust: 100%;
             margin: 0;
             padding: 0;
          }
 
          .ExternalClass {
             width: 100%;
          }
 
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
             line-height: 100%;
          }
 
          #backgroundTable {
             margin: 0;
             padding: 0;
             width: 100% !important;
             line-height: 100% !important;
          }
 
          img {
             outline: none;
             text-decoration: none;
             border: none;
             -ms-interpolation-mode: bicubic;
          }
 
          a img {
             border: none;
          }
 
          .image_fix {
             display: block;
          }
 
          p {
             margin: 0px 0px !important;
          }
 
          table td {
             border-collapse: collapse;
          }
 
          table {
             border-collapse: collapse;
             mso-table-lspace: 0pt;
             mso-table-rspace: 0pt;
          }
 
          table[class=full] {
             width: 100%;
             clear: both;
          }
 
          @media only screen and (max-width: 640px) {
 
             a[href^="tel"],
             a[href^="sms"] {
                text-decoration: none;
                color: #ffffff;
                pointer-events: none;
                cursor: default;
             }
 
             .mobile_link a[href^="tel"],
             .mobile_link a[href^="sms"] {
                text-decoration: default;
                color: #ffffff !important;
                pointer-events: auto;
                cursor: default;
             }
 
             table[class=devicewidth] {
                width: 440px !important;
                text-align: center !important;
             }
 
             table[class=devicewidthinner] {
                width: 420px !important;
                text-align: center !important;
             }
 
             table[class="sthide"] {
                display: none !important;
             }
 
             img[class="bigimage"] {
                width: 420px !important;
                height: 219px !important;
             }
 
             img[class="col2img"] {
                width: 420px !important;
                height: 258px !important;
             }
 
             img[class="image-banner"] {
                width: 440px !important;
                height: 106px !important;
             }
 
             td[class="menu"] {
                text-align: center !important;
                padding: 0 0 10px 0 !important;
             }
 
             td[class="logo"] {
                padding: 10px 0 5px 0 !important;
                margin: 0 auto !important;
             }
 
             img[class="logo"] {
                padding: 0 !important;
                margin: 0 auto !important;
             }
 
          }
 
          @media only screen and (max-width: 480px) {
 
             a[href^="tel"],
             a[href^="sms"] {
                text-decoration: none;
                color: #ffffff;
                pointer-events: none;
                cursor: default;
             }
 
             .mobile_link a[href^="tel"],
             .mobile_link a[href^="sms"] {
                text-decoration: default;
                color: #ffffff !important;
                pointer-events: auto;
                cursor: default;
             }
 
             table[class=devicewidth] {
                width: 280px !important;
                text-align: center !important;
             }
 
             table[class=devicewidthinner] {
                width: 260px !important;
                text-align: center !important;
             }
 
             table[class="sthide"] {
                display: none !important;
             }
 
             img[class="bigimage"] {
                width: 260px !important;
                height: 136px !important;
             }
 
             img[class="col2img"] {
                width: 260px !important;
                height: 160px !important;
             }
 
             img[class="image-banner"] {
                width: 280px !important;
                height: 68px !important;
             }
 
          }
       </style>
    </head>
 
    <body>
       <div class="block">
          <table width="100%" bgcolor="#f6f4f5" cellpadding="0" cellspacing="0" border="0" id="backgroundTable"
             st-sortable="preheader">
             <tbody>
                <tr>
                   <td width="100%">
                      <table width="580" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                         <tbody>
                            <tr>
                               <td width="100%" height="5"></td>
                            </tr>
                            <tr>
                               <td align="right" valign="middle"
                                  style="font-family: Helvetica, arial, sans-serif; font-size: 10px;color: #999999"
                                  st-content="preheader">
                                  <img src="https://i.ibb.co/6n3yvgX/image.png" width="100%">
                               </td>
                            </tr>
                            <tr>
                               <td width="100%" height="5"></td>
                            </tr>
                         </tbody>
                      </table>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
       <div class="block">
          <table width="100%" bgcolor="#f6f4f5" cellpadding="0" cellspacing="0" border="0" id="backgroundTable"
             st-sortable="bigimage">
             <tbody>
                <tr>
                   <td>
                      <table style="background: linear-gradient(to bottom right,rgb(27,45,105),rgb(28, 40, 148));"
                         width="580" align="center" cellspacing="0" cellpadding="0" border="0" class="devicewidth"
                         modulebg="edit">
                         <tbody>
                            <tr>
                               <td width="100%" height="20"></td>
                            </tr>
                            <tr>
                               <td>
                                  <table width="540" align="center" cellspacing="0" cellpadding="0" border="0"
                                     class="devicewidthinner">
                                     <tbody style="color: rgb(60, 0, 64); background:#F7F7F7;">
                                        <tr>
                                           <td width="100%" height="20"></td>
                                        </tr>
                                        <tr>
                                           <td style="font-family: Helvetica, arial, sans-serif; font-size: 30px; text-align:center;line-height: 20px;"
                                              st-title="rightimage-title">
                                              Acto Recepcional
                                           </td>
                                        </tr>
                                        <tr>
                                           <td width="100%" height="10">
                                              <hr style="height:2px; background:black">
                                           </td>
                                        </tr>
                                        <tr>
                                           <td style="font-family: Helvetica, arial, sans-serif; color: rgb(60, 0, 64); font-size:19px; text-align:center; line-height: 24px;"
                                              st-content="rightimage-paragraph">
                                              <b>${SUBTITULO}</b>
                                           </td>
                                        </tr>
                                        <tr>
                                           <td style="font-family: Helvetica, arial, sans-serif; color: rgb(60, 0, 64); font-size:15px; text-align:left; line-height: 24px;"
                                              st-content="rightimage-paragraph">
                                              ${MENSAJE}
                                           </td>
                                        </tr>
                                        <tr>
                                           <td width="100%" height="20"></td>
                                        </tr>
                                     </tbody>
                                  </table>
                               </td>
                            </tr>
                            <tr>
                               <td width="100%" height="20"></td>
                            </tr>
                         </tbody>
                      </table>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
       <div class="block">
          <table width="100%" bgcolor="#f6f4f5" cellpadding="0" cellspacing="0" border="0" id="backgroundTable"
             st-sortable="postfooter">
             <tbody>
                <tr>
                   <td width="100%">
                      <table width="580" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                         <tbody>
                            <tr>
                               <td align="center" valign="middle"
                                  style="font-family: Helvetica, arial, sans-serif; font-size: 10px;color: #999999"
                                  st-content="preheader">
                                  <img src="https://i.ibb.co/SNKJBRf/logo-Tec45.png" width="10%">
                               </td>
                            </tr>
                            <tr>
                               <td width="100%" height="5"></td>
                            </tr>
                            <tr>
                               <td style="font-family: Helvetica, arial, sans-serif; text-align:center; font-size:13px; color: #AEAEAE"
                                  st-content="preheader">
                                  © ITT Instituto Tecnológico de Tepic<br>Tepic, Nayarit, México<br>Dudas o mayor
                                  información al teléfono (311) 211 9400 ext. 317, 430 y 307
                               </td>
                            </tr>
                            <tr>
                               <td width="100%" height="5"></td>
                            </tr>
                         </tbody>
                      </table>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
    </body>
 </html>
    `;
    return template;
  }