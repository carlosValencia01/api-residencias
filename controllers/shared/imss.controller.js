const handler = require('../../utils/handler');
const status = require('http-status');
let _student;
let _imss;

const search = (req, res) => {
  const { search } = req.params;
  var isNumber = isNaN(search);
  let query = '';

  if (!isNumber) {
    query = {
      controlNumber: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: 'IMSS' } }
    };
  } else {
    query = {
      fullName: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: 'IMSS' } }
    };
  }
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, nss: 1, 'documents.$': 1 }).exec(handler.handleMany.bind(null, 'students', res));
};

const getAllInsured = (req, res) => {
  const query = {
    $and: [
      { documents: { $exists: true } },
      { documents: { $elemMatch: { type: 'IMSS' } } }
    ]
  };
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, nss: 1, 'documents.$': 1 }).sort({ 'documents.$.registerDate': -1 }).exec(handler.handleMany.bind(null, 'students', res));
};

const getAllUninsured = async (req, res) => {
  const allStudents = await _getAllStudents();
  const query = {
    $and: [
      { documents: { $exists: true } },
      { documents: { $elemMatch: { type: 'IMSS' } } }
    ]
  };
  _student
    .find(query)
    .select('controlNumber -_id')
    .then(students => {
      const insuredStudents = [...students].map(({controlNumber}) => controlNumber);
      if (students && students.length) {
        const uninsuredStudents = allStudents.filter(({controlNumber}) => !insuredStudents.includes(controlNumber));
        return res.status(status.OK).json({students: uninsuredStudents});
      }
      return res.status(status.OK).json({students: allStudents});
    })
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al consultar estudiantes'}));
};

const uninsuredStudent = (req, res) => {
  const { _controlNumber } = req.params;
  _student
    .findOne({ controlNumber: _controlNumber, documents: { $elemMatch: { type: 'IMSS' } } })
    .then(student => {
      if (!student) {
        return handler.handleError(res, status.NOT_FOUND, { message: 'Estudiante no encontrado' });
      }
      const index = student.documents.findIndex(item => item.type === 'IMSS');
      student.documents.splice(index, 1);
      student.save(function (error) {
        if (error) {
          return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
        }
        return res.status(status.OK).json({ student: student });
      })
    })
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({error: ''}));
};

const insuredStudent = (req, res) => {
  const {_controlNumber} = req.params;
  const doc = req.body;
  doc.status = [
    {
        name: 'ACTIVO',
        active: true,
        message: 'Alumno Asegurado',
        date: new Date()
    }
  ];
  _student.updateOne({controlNumber: _controlNumber}, {$addToSet: {documents: doc}})
    .then(updated => {
      if (updated.nModified) {
        return res.status(status.OK).json({message: 'Estudiante asegurado con éxito'});
      }
      return res.status(status.NOT_FOUND).json({error: 'No se encontró el estudiante'});
    })
    .catch(_ => {
      res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al asegurar estudiante'});
    })
};

const insuredCsv = (req, res) => {
  const students = req.body;
  const findStudent = (data) => {
    return _student.findOne({controlNumber: data.controlNumber})
      .then(student => {
        if (student) {
          data._id = student._id;
          data.exists = true;
          return data;
        } else {
          data.exists = false;
          return data;
        }
      })
      .catch(_ => {
        data.exists = false;
        return data;
      });
  };
  const insuredStudent = (data) => {
    if (data.exists) {
      const doc = {
        registerDate: new Date(),
        type: 'IMSS',
        status: [
          {
            name: 'ACTIVO',
            active: true,
            message: 'Alumno Asegurado',
            date: new Date()
          }
        ]
      };
      const query = {_id: data._id, documents: {$elemMatch: {type: doc.type}}};
      _student.findOne(query)
        .then(student => {
          if (student) {
            return null;
          }
          return _student.updateOne({_id: data._id}, {$addToSet: {documents: doc}});
        })
        .catch(_ => null);
        return null;
    } else {
        _imss.findOne({controlNumber: data.controlNumber})
        .then(controlNumber => {
          if (controlNumber) {
            return null;
          }
          return _imss.create({controlNumber: data.controlNumber, registerDate: new Date()});
        });
    }
  };
  const actions = students.map(findStudent);
  const results = Promise.all(actions);

  results.then(data => {
      return Promise.all(data.map(insuredStudent));
  });

  results
    .then((data) => {
      return res.status(status.OK).json({ 'data': data });
    })
    .catch((error) => {
      return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error });
    });
};

const _getAllStudents = () => {
  return new Promise(resolve => {
    _student.find({}, { controlNumber: 1, fullName: 1, career: 1, nss: 1 })
      .then(data => resolve(data))
      .catch(_ => resolve([]));
  });
};

module.exports = (Student, Imss) => {
  _student = Student;
  _imss = Imss;
  return ({
    search,
    uninsuredStudent,
    getAllInsured,
    getAllUninsured,
    insuredStudent,
    insuredCsv,
  });
};