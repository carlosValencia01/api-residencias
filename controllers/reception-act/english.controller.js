const handler = require('../../utils/handler');
const status = require('http-status');
let _student;
let _english;

const search = (req, res) => {
  const { search } = req.params;
  var isNumber = isNaN(search);
  let query = '';

  if (!isNumber) {
    query = {
      controlNumber: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: 'Ingles' } }
    };
  } else {
    query = {
      fullName: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: 'Ingles' } }
    };
  }
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, 'documents.$': 1 }).exec(handler.handleMany.bind(null, 'students', res));
};

const getAllReleased = (req, res) => {
  const query = {
    $and: [
      { documents: { $exists: true } },
      { documents: { $elemMatch: { type: 'Ingles' } } }
    ]
  };
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, 'documents.$': 1 }).sort({ 'documents.$.releaseDate': -1 }).exec(handler.handleMany.bind(null, 'students', res));
};

const getAllNotReleased = async (req, res) => {
  const allStudents = await _getAllStudents();
  const query = {
    $and: [
      { documents: { $exists: true } },
      { documents: { $elemMatch: { type: 'Ingles' } } }
    ]
  };
  _student
    .find(query)
    .select('controlNumber -_id')
    .then(students => {
      const releasedStudents = [...students].map(({controlNumber}) => controlNumber);
      if (students && students.length) {
        const studentsNotReleased = allStudents.filter(({controlNumber}) => !releasedStudents.includes(controlNumber));
        return res.status(status.OK).json({students: studentsNotReleased});
      }
      return res.status(status.OK).json({students: allStudents});
    })
    .catch(_ => res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al consultar estudiantes'}));
};

// Deprecated
// const create = (req, res) => {
//   let student = req.body;
//   _student.findOne({ controlNumber: student.controlNumber }).then(
//     oneStudent => {
//       console.log('one', oneStudent);
//       if (!oneStudent) {        
//         student.document.releaseDate=new Date();
//         student.documents = new Array(student.document);
//         console.log('one', student);
//         _student.create(student).then(created => {
//           console.log('ESTUDIANTE ASS', created);
//           var json = {};
//           json['student'] = created;
//           res.json(json);
//         }).catch(err => {
//           return handler.handleError(res, status.INTERNAL_SERVER_ERROR, err);
//         });
//       }
//       else {
//         const _doc = student.document;
//         _doc.releaseDate = new Date();        
//         const query = { _id: oneStudent._id, documents: { $elemMatch: { type: _doc.type } } };
//         const push = { $push: { documents: _doc } };

//         _student.findOne(query).then(studentDoc => {
//           if (studentDoc) {            
//             _student.findOneAndUpdate(query, { $set: { 'documents.$.status': _doc.status, 'documents.$.releaseDate': new Date() } }, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
//           }
//           else {            
//             _student.findOneAndUpdate({ _id: oneStudent._id }, push, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
//           }
//         });
//       }
//     });
// };

const releaseRemove = (req, res) => {
  const { _controlNumber } = req.params;
  _student
    .findOne({ controlNumber: _controlNumber, documents: { $elemMatch: { type: 'Ingles' } } })
    .then(student => {
      if (!student) {
        return handler.handleError(res, status.NOT_FOUND, { message: 'Estudiante no encontrado' });
      }
      const index = student.documents.findIndex(item => item.type === 'Ingles');
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

const releaseStudent = (req, res) => {
  const {_controlNumber} = req.params;
  const doc = req.body;
  doc.status = [
    {
        name: 'ACTIVO',
        active: true,
        message: 'Inglés liberado',
        date: new Date(),
    }
  ];
  _student.updateOne({controlNumber: _controlNumber}, {$addToSet: {documents: doc}})
    .then(updated => {
      if (updated.nModified) {
        return res.status(status.OK).json({message: 'Estudiante liberado con éxito'});
      }
      return res.status(status.NOT_FOUND).json({error: 'No se encontró el estudiante'});
    })
    .catch(_ => {
      res.status(status.INTERNAL_SERVER_ERROR).json({error: 'Error al liberar estudiante'});
    })
};

const releaseEnglishCsv = (req, res) => {
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
  const releaseEnglish = (data) => {
    if (data.exists) {
      const doc = {
        releaseDate: new Date(),
        type: 'Ingles',
        status: [
          {
              name: 'ACTIVO',
              active: true,
              message: 'Inglés liberado',
              date: new Date(),
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
      _english.findOne({controlNumber: data.controlNumber})
        .then(controlNumber => {
          if (controlNumber) {
            return null;
          }
          return _english.create({controlNumber: data.controlNumber, releaseDate: new Date()});
        });
    }
  };
  const actions = students.map(findStudent);
  const results = Promise.all(actions);

  results.then(data => {
      return Promise.all(data.map(releaseEnglish));
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
    _student.find({}, { controlNumber: 1, fullName: 1, career: 1 })
      .then(data => resolve(data))
      .catch(_ => resolve([]));
  });
};

module.exports = (Student, English) => {
  _student = Student;
  _english = English;
  return ({
    search,
    releaseRemove,
    getAllReleased,
    getAllNotReleased,
    releaseStudent,
    releaseEnglishCsv,
  });
};

