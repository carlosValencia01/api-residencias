const router = require('express').Router();

module.exports = (wagner) => {
  const permissionCtrl = wagner.invoke((Permission, Role) =>
    require('../../controllers/app/permission.controller.js')(Permission, Role));

  router.get('/', (req, res) =>
    permissionCtrl.getAllPermissions(req, res));

  router.get('/byCategories', (req, res) =>
    permissionCtrl.getAllByCategories(req, res));

  router.post('/', (req, res) =>
    permissionCtrl.createPermission(req, res));

  router.put('/:_id', (req, res) =>
    permissionCtrl.updatePermission(req, res));

  router.delete('/:_id', (req, res) =>
    permissionCtrl.removePermission(req, res));

  return router;
};