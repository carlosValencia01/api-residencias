const handler = require('../../utils/handler');
const status = require('http-status');

let _permission;
let _role;

const getAllPermissions = (req, res) => {
  _permission.find().exec(handler.handleMany.bind(null, 'permissions', res));
};

const getAllByCategories = (req, res) => {
  let query =
    [
      {
        $group: {
          _id: '$category',
          permissions:
          {
            $push: {
              _id: '$_id',
              label: '$label',
              icon: '$icon',
              routerLink: '$routerLink',
              category: '$category',
            }
          }
        }
      },
      { $addFields: { category: '$_id' } },
      { $unset: '_id' },
      { $sort: { 'category': 1 } }
    ];
  
  _permission.aggregate(query).exec(handler.handleMany.bind(null, 'permissions', res));
};

const createPermission = (req, res) => {
  const newPermission = req.body;

  _permission.create(newPermission)
    .then((permission) => ( res.status(status.OK)
      .json(permission) ))
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error: 'Ocurrió un error' }) ));
};

const updatePermission = (req, res) => {
  const { _id } = req.params;
  const newPermission = req.body;

  _permission.updateOne({ _id: _id }, newPermission)
    .then((updated) => {
      const response = {};
      if (updated && updated.n) {
        if (updated.nModified) {
          response.status = status.OK;
          response.message = 'Permiso modificado con éxito';
        } else {
          response.status = status.INTERNAL_SERVER_ERROR,
          response.error_msj = 'No se pudo actualizar el permiso';
        }
      } else {
        response.status = status.NOT_FOUND;
        response.error_msj = 'No se encontró el permiso';
      }
      res.status(response.status).json(response);
    })
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error_msj: 'Ocurrió un error al actualizar el permiso' }) ));
};

const removePermission = async (req, res) => {
  const { _id } = req.params;
  const canDelete = await _canDeletePermission(_id);

  if (!canDelete) {
    return res.status(status.INTERNAL_SERVER_ERROR)
      .json({ error_msj: 'No se puede borrar el permiso' });
  }

  _permission.deleteOne({ _id: _id })
    .then((deleted) => {
      if (deleted && deleted.ok && deleted.deletedCount) {
        return res.status(status.OK).json({ message: 'Permiso borrado con éxito' });
      }
      return res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'No se pudo borrar el permiso' });
    })
    .catch((err) => ( res.status(status.INTERNAL_SERVER_ERROR)
      .json(err || { error_msj: 'Ocurrió un error' }) ));
};

const _canDeletePermission = (permissionId) => {
  return new Promise((resolve) => {
    _role.findOne({ permissions: permissionId })
      .then((role) => role ? resolve(false) : resolve(true))
      .catch((_) => resolve(false));
  });
};

module.exports = (Permission, Role) => {
  _permission = Permission;
  _role = Role;

  return ({
    getAllPermissions,
    getAllByCategories,
    createPermission,
    updatePermission,
    removePermission,
  });
};