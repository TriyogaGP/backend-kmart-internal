const { Router } = require('express');
const {
  hitManualKMart,
  getdataHarian,
  getdataOrder,
  getProductOrderSummary,
  getProductVariant,
  exportExcel,
  getdataNonCod,
  hitUpdateStatus,
  getdataKmart,
  getDashboardTransaksi,
  testing,
} = require('../controllers/kmart.controller')
const {
  updateUserAcquisition,
  updateUserInstall,
  getUserGoogle
} = require('../controllers/google-loader.controller')
const { verifyToken } = require('../middleware/VerifyToken');
const { uploadBerkas } = require('../middleware/uploadBerkas');

module.exports = models => {
  const route = Router();
  route.route('/getDashboardTransaksi').get(getDashboardTransaksi(models))
  route.route('/hitManualKMart').post(verifyToken, hitManualKMart())
  route.route('/getdataHarian').get(verifyToken, getdataHarian())
  route.route('/getdataOrder').get(verifyToken, getdataOrder())
  route.route('/getdataProductOrderSummary').get(verifyToken, getProductOrderSummary())
  route.route('/getdataVariantProduct').get(verifyToken, getProductVariant())
  route.route('/getdataNonCod').get(verifyToken, getdataNonCod())
  route.route('/hitUpdateStatus').get(verifyToken, hitUpdateStatus())
  route.route('/exportExcel').get(exportExcel())
  route.route('/getdataKmart').get(verifyToken, getdataKmart())
  route.route('/getUserGoogle').get(verifyToken, getUserGoogle(models))
  route.route('/google/loader/UserAcquisition').post(uploadBerkas, updateUserAcquisition(models))
  route.route('/google/loader/UserInstall').post(uploadBerkas, updateUserInstall(models))
  route.route('/testing').get(testing(models))
  
  return route;
}