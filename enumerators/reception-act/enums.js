const eFile = {
    PROYECTO: 'PROYECTO',
    SOLICITUD: 'SOLICITUD',
    REGISTRO: 'REGISTRO',
    CURP: 'CURP',
    ACTA_NACIMIENTO: 'ACTA_NACIMIENTO',
    CERTIFICADO_B: 'CERTIFICADO_BACHILLERATO',
    CEDULA: 'CEDULA_TECNICA',
    CERTIFICADO_L: 'CERTIFICADO_LICENCIATURA',
    SERVICIO: 'SERVICIO_SOCIAL',
    INGLES: 'LIBERACION_INGLES',
    PAGO: 'RECIBO',
    CERTIFICADO_R: 'REVALIDACION',
    RELEASED: 'LIBERACION',
    INCONVENIENCE: 'NO_INCONVENIENCIA',
    PHOTOS: 'FOTOS',
    INE: 'INE',
    CED_PROFESIONAL: 'CEDULA_PROFESIONAL',
    XML: 'XML'
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
    MAESTRIA_EN_TECNOLOGIAS_DE_LA_INFORMACION: 'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN',
    MAESTRIA_EN_CIENCIAS_DE_ALIMENTOS: 'MAESTRIA EN CIENCIAS DE ALIMENTOS',
    DOCTORADO_EN_CIENCIAS_DE_ALIMENTOS: 'DOCTORADO EN CIENCIAS DE ALIMENTOS'
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
}

module.exports = {
    eCareer,
    eFile,
    eRequest,
    eRole,
    eStatusRequest,
    eOperation
};
