const eFile = {
    PROYECTO: 'PROYECTO',
    SOLICITUD: 'SOLICITUD',
    REGISTRO: 'REGISTRO',
    CURP: '1_CURP',
    ACTA_NACIMIENTO: '2_ACTA_NACIMIENTO',
    CERTIFICADO_B: '3_CERTIFICADO_BACHILLERATO',
    CEDULA: '4_CEDULA_TECNICA',
    CERTIFICADO_L: '5_CERTIFICADO_LICENCIATURA',
    SERVICIO: 'SERVICIO_SOCIAL',
    INGLES: 'LIBERACION_INGLES',
    PAGO: 'RECIBO',
    CERTIFICADO_R: 'REVALIDACION',
    RELEASED: 'LIBERACION',
    INCONVENIENCE: 'NO_INCONVENIENCIA',
    PHOTOS: 'FOTOS',
    INE: 'INE',
    CED_PROFESIONAL: 'CEDULA_PROFESIONAL',
    XML: 'XML',
    OFICIO: 'OFICIO_JURADO',
    JURAMENTO_ETICA: 'JURAMENTO_ETICA',
    ACTA_EXAMEN: '6_ACTA_EXAMEN'
};

const eCareer = {
    ARQUITECTURA: 'ARQUITECTURA',
    INGENIERIA_CIVIL: 'INGENIERÍA CIVIL',
    INGENIERIA_ELECTRICA: 'INGENIERÍA ELÉCTRICA',
    INGENIERIA_INDUSTRIAL: 'INGENIERÍA INDUSTRIAL',
    INGENIERIA_EN_SISTEMAS_COMPUTACIONALES: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES',
    INGENIERIA_BIOQUIMICA: 'INGENIERÍA BIOQUÍMICA',
    INGENIERIA_QUIMICA: 'INGENIERÍA QUÍMICA',
    LICENCIATURA_EN_ADMINISTRACION: 'LICENCIATURA EN ADMINISTRACIÓN',
    INGENIERIA_EN_GESTION_EMPRESARIAL: 'INGENIERÍA EN GESTIÓN EMPRESARIAL',
    INGENIERIA_MECATRONICA: 'INGENIERÍA MECATRÓNICA',
    INGENIERIA_EN_TECNOLOGIAS_DE_LA_INFORMACION_Y_COMUNICACIONES: 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES',
    MAESTRIA_EN_TECNOLOGIAS_DE_LA_INFORMACION: 'MAESTRíA EN TECNOLOGÍAS DE LA INFORMACIÓN',
    MAESTRIA_EN_CIENCIAS_DE_ALIMENTOS: 'MAESTRíA EN CIENCIAS EN ALIMENTOS',
    DOCTORADO_EN_CIENCIAS_DE_ALIMENTOS: 'DOCTORADO EN CIENCIAS EN ALIMENTOS'
};

const eRequest = {
    NONE: 'Ninguno',
    CAPTURED: 'Capturado',
    SENT: 'Enviado',
    VERIFIED: 'Verificado',
    REGISTERED: 'Registrado',
    RELEASED: 'Liberado',
    DELIVERED: 'Entregado',
    VALIDATED: 'Validado',
    ASSIGNED: 'Asignado',
    REALIZED: 'Realizado',
    GENERATED: 'Generado',
    TITLED: 'Titulado'
};

const eRole = {
    eSECRETARY: 'secretaria',
    eCOORDINATION: 'coordinacion',
    eCHIEFACADEMIC: 'jefe',
    eSTUDENTSERVICES: 'servicios',
    eHEADSCHOOLSERVICE: 'escolares'
};

const eStatusRequest = {
    NONE: 'None',
    PROCESS: 'Process',
    ERROR: 'Error',
    ACCEPT: 'Accept',
    REJECT: 'Reject',
    WAIT: 'Wait',
    CANCELLED: 'Cancelled',
    ASSIGN: 'Assign',
    PRINTED: 'Printed',
    FINALIZED: 'Finalized'
};

const eOperation = {
    NEW: 'New',
    EDIT: 'Edit',
    DELETE: 'Delete'
};

const eInsFiles = {
    PHOTO : 'FOTO',
    CERTIFICATE_BACH : 'CERTIFICADO',
    PAY: 'COMPROBANTE',
    LETTER_BACH: 'COMPROMISO',
    CURP: 'CURP',
    BIRTH_CERTIFICATE: 'ACTA',
    NSS: 'NSS',
    CLINIC: 'CLINICOS',
    CERTIFICATE_LIC:'CERTIFICADO_LICENCIATURA.pdf',
    DEGREE_LIC:'TITULO_LICENCIATURA.pdf',
    CED_LIC:'CEDULA_LICENCIATURA.pdf',
    TEST_LIC:'EXAMEN_LICENCIATURA.pdf',
    LETTER_CERT_LIC:'COMPROMISO_CERTIFICADO_LICENCIATURA.pdf',
    LETTER_DEGREE_LIC:'COMPROMISO_TITULO_LICENCIATURA.pdf',
    LETTER_CED_LIC:'COMPROMISO_CEDULA_LICENCIATURA.pdf',
    LETTER_TEST_LIC:'COMPROMISO_EXAMEN_LICENCIATURA.pdf',
    CERTIFICATE_MA:'CERTIFICADO_MAESTRIA.pdf',
    DEGREE_MA:'TITULO_MAESTRIA.pdf',
    CED_MA:'CEDULA_MAESTRIA.pdf',
    TEST_MA:'EXAMEN_MAESTRIA.pdf',
    LETTER_CERT_MA:'COMPROMISO_CERTIFICADO_MAESTRIA.pdf',
    LETTER_DEGREE_MA:'COMPROMISO_TITULO_MAESTRIA.pdf',
    LETTER_CED_MA:'COMPROMISO_CEDULA_MAESTRIA.pdf',
    LETTER_TEST_MA:'COMPROMISO_EXAMEN_MAESTRIA.pdf'
    

};
module.exports = {
    eCareer,
    eFile,
    eRequest,
    eRole,
    eStatusRequest,
    eOperation,
    eInsFiles
};
