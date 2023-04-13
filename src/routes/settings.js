const { Router } = require('express');
const {
  getEncrypt,
  getDecrypt,
  getMenu,
  crudMenu,
  getSequenceMenu,
  crudSequenceMenu,
  getRole,
  crudRole,
  getRoleMenu,
  crudRoleMenu,
  getWilayah,
} = require('../controllers/settings.controler')
const { uploadFile } = require('../middleware/uploadFile')
const { uploadBerkas } = require('../middleware/uploadBerkas')
const { verifyToken } = require('../middleware/VerifyToken');

module.exports = models => {
  const route = Router();
  route.route('/encryptPass').get(getEncrypt())
  route.route('/decryptPass').get(getDecrypt())
  route.route('/getMenu').get(getMenu(models))
  route.route('/postMenu').post(crudMenu(models))
  route.route('/getSequenceMenu').get(getSequenceMenu(models))
  route.route('/postSequenceMenu').post(crudSequenceMenu(models))
  route.route('/getRole').get(getRole(models))
  route.route('/postRole').post(crudRole(models))
  route.route('/getRoleMenu').get(getRoleMenu(models))
  route.route('/postRoleMenu').post(crudRoleMenu(models))
  route.route('/getWilayah').get(verifyToken, getWilayah(models))
  
  return route;
}