const { Router } = require('express');
const {
  getEncrypt,
  getDecrypt,
  getRole,
  getWilayah,
} = require('../controllers/settings.controler')
const { uploadFile } = require('../middleware/uploadFile')
const { uploadBerkas } = require('../middleware/uploadBerkas')
const { verifyToken } = require('../middleware/VerifyToken');

module.exports = models => {
  const route = Router();
  route.route('/encryptPass').get(getEncrypt())
  route.route('/decryptPass').get(getDecrypt())
  route.route('/getRole').get(getRole(models))
  route.route('/getWilayah').get(verifyToken, getWilayah(models))
  
  return route;
}