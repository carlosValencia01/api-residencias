const status = require('http-status');

let _document;
let _position;

const getAllDocuments = (req, res) => {
    _document.find({})
        .exec(async (err, docs) => {
            if (!err && docs) {
                let documents = [];
                for(let doc of docs) {
                    const deptos = await getDepartments(doc._id);
                    doc._doc.departments = [...new Set(deptos)];
                    documents.push(doc);
                }
                res.json(documents);
            }
        });
    const getDepartments = (docId) => {
      return new Promise(async resolve => {
          await _position.find({ documents: docId }, { ascription: 1, _id: 0 })
              .populate({ path: 'ascription', model: 'Department', select: 'shortName -_id' })
              .exec((err, positions) => {
                  if (!err && positions) {
                      resolve(positions.map(pos => pos.ascription.shortName));
                  }
              });
      });
    };
};

const createDocument = (req, res) => {
    const document = req.body;
    _document.create(document)
        .then((doc) => {
            res.json(doc);
        })
        .catch((err) => {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err.toString()
            });
        });
};

const updateDocument = (req, res) => {
    const { _id } = req.params;
    const document = req.body;
    _document.updateOne({ _id: _id }, document, (err, data) => {
        if (!err && data) {
            res.json({ status: data.n ? status.OK : status.NOT_FOUND });
        } else {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err.toString()
            });
        }
    });
};

const removeDocument = (req, res) => {
    const { _id } = req.params;
    _position.find({ documents: _id }, (err, docs) => {
        if(!err && !docs.length) {
            _document.deleteOne({ _id: _id }, (err, data) => {
                if (!err && data) {
                    res.json({ status: data.n && data.deletedCount ? status.OK : status.NOT_FOUND });
                } else {
                    res.json({
                        status: status.INTERNAL_SERVER_ERROR,
                        error: err ? err.toString() : 'No se pudo borrar el documento'
                    });
                }
            });
        } else {
            res.json({
                status: status.INTERNAL_SERVER_ERROR,
                error: err ? err.toString() : 'El documento está asignado'
            });
        }
    });
};

module.exports = (Document, Position) => {
    _document = Document;
    _position = Position;
    return ({
        getAllDocuments,
        createDocument,
        updateDocument,
        removeDocument,
    });
};
