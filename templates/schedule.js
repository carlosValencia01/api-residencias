module.exports = (studentData,bossDivEst,_dateSchedule) => {
    const materias = studentData.schedule;
    let listaMaterias = '';
    let global = '';
    let horario = '';
    let totalCreditos = 0;
    let fecha_firma = _dateSchedule;
    let periodo = studentData.period;
    let tipoPeriodo = periodo.substr(periodo.length-1,periodo.length) === '1' ? 'Ene-Jun' : periodo.substr(periodo.length-1,periodo.length) === '2' ? 'Verano' : 'Ago-Dic';
    let periodoNombre = tipoPeriodo+'/'+periodo.substr(0,periodo.length-1);


    for(let i = 0; i < materias.length; i++){  

        totalCreditos += materias[i].credits;
        global = materias[i].global ? "Si" : "";
        horario = '';

        horario += materias[i].monday.startDate ? '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].monday.startDate+' - '+materias[i].monday.endDate+'<br>'+materias[i].monday.classroom+'</th>' : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';
        horario += materias[i].tuesday.startDate ? '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].tuesday.startDate+' - '+materias[i].tuesday.endDate+'<br>'+materias[i].tuesday.classroom+'</th>' : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';
        horario += materias[i].wednesday.startDate ? '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].wednesday.startDate+' - '+materias[i].wednesday.endDate+'<br>'+materias[i].wednesday.classroom+'</th>' : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';
        horario += materias[i].thursday.startDate ? '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].thursday.startDate+' - '+materias[i].thursday.endDate+'<br>'+materias[i].thursday.classroom+'</th>'  : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';
        horario += materias[i].friday.startDate ? '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].friday.startDate+' - '+materias[i].friday.endDate+'<br>'+materias[i].friday.classroom+'</th>' : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';
        horario += materias[i].saturday.startDate ?'<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].saturday.startDate+' - '+materias[i].saturday.endDate+'<br>'+materias[i].saturday.classroom+'</th>' : '<th style="text-align: center; font-size:8px; border: 1pt solid black; font-weight: normal;"></th>';                                                               
        
        listaMaterias += '<tr>'+
            '<th style="width: 19%; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].subjectCode+'<br>'+materias[i].subjectName+'<br>'+materias[i].subjectTeacher+'</th>'+
            '<th style="width: 5%; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].group+'</th>'+
            '<th style="width: 5%; font-size:8px; border: 1pt solid black; font-weight: normal;">'+materias[i].credits+'</th>'+
            '<th style="width: 5%; font-size:8px; border: 1pt solid black; font-weight: normal;">'+global+'</th>'+
            horario+
        '</tr>'

    }

    const template = `
    <html>
    <link href='https://fonts.googleapis.com/css?family=Arial' rel='stylesheet'>
    <style>
    body {
        font-family: 'Arial';
    }
    </style>
    <head>
    <table style="width: 100%;">
        <tbody>
            <tr>
                <th width="60">
                    <img class="adapt-img" style="display: block;" src="https://i.ibb.co/23NMC5H/Tec-NM-opacidad.png" alt="" width="45" align="left" />
                </th>
                <th valign="top" style="text-align: center; font-weight: bold;">
                    Instituto Tecnol&oacute;gico de Tepic <br> HORARIO ALUMNO
                </th>
                <th width="60">
                    <img class="adapt-img" style="display: block;" src="https://i.ibb.co/1JPN1Bz/logo-ittepic-opacidad.png" alt="" width="55" align="right" />
                </th>
            </tr>
        </tbody>
    </table>
    </head>
    
    <body style="background: url(https://i.ibb.co/23NMC5H/Tec-NM-opacidad.png); background-repeat: no-repeat; background-size: 200px;   background-position: 50% 25%;">
        <table style="width: 100%;">
            <tbody>
                <tr>
                    <th style="width: 20%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">No. de Control</th>
                    <th style="width: 33%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">Nombre del Alumno</th>
                    <th style="width: 20%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">Semestre</th>
                    <th style="width: 27%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">Periodo Escolar</th>
                </tr>
                <tr>
                    <th style="width: 20%; font-size:10px; font-weight: normal;">${studentData.studentData.controlNumber}</th>
                    <th style="width: 33%; font-size:10px; font-weight: normal;">${studentData.studentData.fullName}</th>
                    <th style="width: 20%; font-size:10px; font-weight: normal;">${studentData.studentData.semester}</th>
                    <th style="width: 27%; font-size:10px; font-weight: normal;">${periodoNombre}</th>
                </tr>
            </tbody>
        </table>
        <table style="width: 100%;">
            <tbody>
                <tr>
                    <th style="width: 50%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">Carrera</th>
                    <th style="width: 50%; border-bottom: 1pt solid black; font-size:12px; font-weight: bold;">Especialidad</th>
                </tr>
                <tr>
                    <th style="width: 50%; font-size:10px; font-weight: normal;">${studentData.studentData.career}</th>
                    <th style="width: 50%; font-size:10px; font-weight: normal;">${studentData.specialty}</th>
                </tr>
            </tbody>
        </table>
        <table style="width: 100%; margin-top:10px; border-collapse: collapse; border: 1pt solid black;">
            <tbody>
                <tr>
                    <th style="width: 19%; font-size:10px; border: 1pt solid black; font-weight: bold;">Materia</th>
                    <th style="width: 5%; font-size:10px; border: 1pt solid black; font-weight: bold;">Gpo</th>
                    <th style="width: 5%; font-size:10px; border: 1pt solid black; font-weight: bold;">CR</th>
                    <th style="width: 5%; font-size:10px; border: 1pt solid black; font-weight: bold;">Sem</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Lunes</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Martes</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Miércoles</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Jueves</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Viernes</th>
                    <th style="width: 11%; font-size:10px; border: 1pt solid black; font-weight: bold;">Sábado</th>
                </tr>`+
                listaMaterias+
                `
            </tbody>
        </table>
        <table style="width: 100%;">
            <tbody>
                <tr>
                    <div style="width: 50%; text-align: center;">
                        <image src='http://drive.google.com/uc?export=view&id=1lecA25mhPluM_l8vovddbfGxA1JleJjg' width="110">
                    </div>
                    <th style="width: 50%; border-bottom: 1pt solid black; font-size:10px; font-weight: normal;">
                    ${bossDivEst}
                    </th>
                    <th style="width: 50%; border-bottom: 1pt solid black; font-size:10px; font-weight: normal;">${studentData.studentData.fatherLastName} ${studentData.studentData.motherLastName} ${studentData.studentData.firstName}</th>
                </tr>
                <tr>
                    <th style="width: 50%; font-size:10px; font-weight: bold;">JEFE DE LA DIVISION DE ESTUDIOS PROFESIONALES</th>
                    <th style="width: 50%; font-size:10px; font-weight: bold;">ALUMNO</th>
                </tr>
            </tbody>
        </table>
        <div style="text-align: left; font-size:10px; font-weight: bold;">
            <p>Horario firmado electrónicamente por el alumno el día `+fecha_firma+`</p>
        </div>
        <div style="text-align: right; font-size:10px;">
            <img src='http://chart.googleapis.com/chart?chl=+${studentData.nc}+&chs=125x125&cht=qr'>
        </div>
    </body>

    <footer style="font-size:10px; position: absolute; bottom: 0;">
        <p>Sem: Semipresencial</p>
    </footer>
    </html>
    `;
    return template;
  }