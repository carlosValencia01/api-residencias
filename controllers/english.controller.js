const handler = require('../utils/handler');
const status = require('http-status');
let _student;

const loadData = (req, res) => {
    const student = req.body;

    _student.create(student)
        .then(created => {
            res.json(created);
        })
        .catch(err => {
            res.json({
                error: err.toString(),
                status: status.INTERNAL_SERVER_ERROR
            });
        });
};

const validateControlNumber = (req, res) => {
    const {controlNumber} = req.params;

    _student.findOne({controlNumber: controlNumber}, (err, doc) => {
        if (!err && doc) {
            return res.json({
                ok: true,
                data: doc,
                status: status.OK
            });
        }
        res.json({
            ok: false,
            error: 'No se encontró el número de control',
            status: status.NOT_FOUND
        });
    });
};

const search = (req, res) => {
  const { search } = req.params;
  var isNumber = isNaN(search);
  let query = "";

  if (!isNumber) {
    query = {
      controlNumber: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: "Ingles" } }
    };
  } else {
    query = {
      fullName: {
        $regex: new RegExp(search, 'i')
      },
      documents: { $elemMatch: { type: "Ingles" } }
    };
  }
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, "documents.$": 1 }).exec(handler.handleMany.bind(null, 'students', res));
};

const getAll = (req, res) => {
  query = {
    $and: [
      { documents: { $exists: true } },
      { documents: { $elemMatch: { type: "Ingles" } } }
    ]
  };
  _student.find(query, { controlNumber: 1, fullName: 1, career: 1, "documents.$": 1 }).sort({ "documents.$.releaseDate": -1 }).limit(100).exec(handler.handleMany.bind(null, 'students', res));
};

const create = (req, res) => {
  let student = req.body;
  _student.findOne({ controlNumber: student.controlNumber }).then(
    oneStudent => {
      console.log("one", oneStudent);
      if (!oneStudent) {        
        student.document.releaseDate=new Date();
        student.documents = new Array(student.document);
        console.log("one", student);
        _student.create(student).then(created => {
          console.log("ESTUDIANTE ASS", created);
          var json = {};
          json['student'] = created;
          res.json(json);
        }).catch(err => {
          return handler.handleError(res, status.INTERNAL_SERVER_ERROR, err);
        });
      }
      else {
        const _doc = student.document;
        _doc.releaseDate = new Date();        
        const query = { _id: oneStudent._id, documents: { $elemMatch: { type: _doc.type } } };
        const push = { $push: { documents: _doc } };

        _student.findOne(query).then(studentDoc => {
          if (studentDoc) {            
            _student.findOneAndUpdate(query, { $set: { "documents.$.status": _doc.status, "documents.$.releaseDate": new Date() } }, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
          }
          else {            
            _student.findOneAndUpdate({ _id: oneStudent._id }, push, { new: true }).exec(handler.handleOne.bind(null, 'student', res));
          }
        });
      }
    });
};

const remove = (req, res) => {
  const { _id } = req.params;
  _student.findOne({ _id: _id, documents: { $elemMatch: { type: 'Ingles' } } }, (error, student) => {
    if (error) {
      return handler.handleError(res, status.INTERNAL_SERVER_ERROR, error);
    }
    if (!student) {
      return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { message: "Estudiante no encontrado" });
    }
    let index = student.documents.findIndex(item => item.type === "Ingles");
    student.documents.splice(index, 1);
    student.save(function (error) {
      if (error) {
        return handler.handleError(res, status.INTERNAL_SERVER_ERROR, { error });
      }
      return res.status(status.OK).json({ student: student });
    })
  });
};

module.exports = (Student) => {
  _student = Student;
  return ({
    search,
    create,
    remove,
    getAll
  });
};

