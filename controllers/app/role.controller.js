const handler = require('../../utils/handler');
const status = require('http-status');

let _role;
let _position;

const getAll = (req, res) => {                
  _role.find({}).exec(handler.handleMany.bind(null, 'role', res));
};

const createRole = (req, res) => {
  const role = req.body;

  _role.create(role)
    .then((newRole) => res.status(status.OK).json(newRole))
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error_msj: 'Ocurrió un error al crear rol' }) ));
};

const updateRole = (req, res) => {
  const { _id } = req.params;
  const newRole = req.body;

  _role.updateOne({ _id: _id }, newRole)
    .then((updated) => {
      const response = {};
      if (updated && updated.n) {
        if (updated.nModified) {
          response.status = status.OK;
          response.message = 'Rol modificado con éxito';
        } else {
          response.status = status.INTERNAL_SERVER_ERROR,
          response.error_msj = 'No se pudo actualizar el rol';
        }
      } else {
        response.status = status.NOT_FOUND;
        response.error_msj = 'No se encontró el rol';
      }
      res.status(response.status).json(response);
    })
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error_msj: 'Ocurrió un error al actualizar el rol' }) ));
};

const removeRole = async (req, res) => {
  const { _id } = req.params;
  const canDelete = await _canDeleteRole(_id);

  if (!canDelete) {
    return res.status(status.INTERNAL_SERVER_ERROR)
      .json({ error_msj: 'No se puede borrar el rol' });
  }

  _role.deleteOne({ _id: _id })
    .then((deleted) => {
      if (deleted && deleted.ok && deleted.deletedCount) {
        return res.status(status.OK).json({ message: 'Rol borrado con éxito' });
      }
      return res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'No se pudo borrar el rol' });
    })
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error_msj: 'Ocurrió un error' }) ));
};

const _canDeleteRole = (roleId) => {
  return new Promise((resolve) => {
    _position.findOne({ role: roleId })
      .then((position) => position ? resolve(false) : resolve(true))
      .catch((_) => resolve(false));
  });
};

module.exports = (Role, Position) => {
  _role = Role;
  _position = Position;

  return ({
    getAll,
    createRole,
    updateRole,
    removeRole,
  });
};
