const { Router } = require('express');
const {
  hitManualKMart,
  getdataHarian,
  getdataOrder,
  getProductOrderSummary,
  getProductVariant,
  getdataNonCod,
  hitUpdateStatus,
  getdataKmart,
  getDashboardTransaksi,
  getDashboardUserActive,
  getDashboardProduct,
  getdataConsumer,
  getTopicUser,
  getOrderUser,
  getTransaksiDetail,
  blastNotifikasi,
  setupConsumer,
  getUserNotifikasi,
  getDetailUserActive,
  getDetailOrderUserActive,
  reloadDashboardTransaksi,
  reloadDashboardUserActive,
  exportExcel,
  exportExcelConsumer,
  detailTransaksiOrder,
  testing,
  // ----- PLBBO ----- //
  getBiodata,
  // ----- PLBBO ----- //
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
  route.route('/getDashboardUserActive').get(getDashboardUserActive(models))
  route.route('/getDashboardProduct').get(getDashboardProduct(models))
  route.route('/hitManualKMart').post(verifyToken, hitManualKMart())
  route.route('/getdataHarian').get(verifyToken, getdataHarian())
  route.route('/getdataOrder').get(verifyToken, getdataOrder())
  route.route('/getdataProductOrderSummary').get(verifyToken, getProductOrderSummary())
  route.route('/getdataVariantProduct').get(verifyToken, getProductVariant())
  route.route('/getdataNonCod').get(verifyToken, getdataNonCod())
  route.route('/getdataConsumer').get(verifyToken, getdataConsumer())
  route.route('/getdataTopicConsumer').get(verifyToken, getTopicUser())
  route.route('/getdataOrderConsumer').get(verifyToken, getOrderUser())
  route.route('/getTransaksiDetail').get(verifyToken, getTransaksiDetail())
  route.route('/hitUpdateStatus').get(verifyToken, hitUpdateStatus())
  route.route('/getdataKmart').get(verifyToken, getdataKmart())
  route.route('/getUserGoogle').get(verifyToken, getUserGoogle(models))
  route.route('/google/loader/UserAcquisition').post(uploadBerkas, updateUserAcquisition(models))
  route.route('/google/loader/UserInstall').post(uploadBerkas, updateUserInstall(models))
  route.route('/getDetailUserActive').get(getDetailUserActive(models))
  route.route('/getDetailOrderUserActive').get(getDetailOrderUserActive(models))
  route.route('/reloadDashboardTransaksi').get(reloadDashboardTransaksi(models))
  route.route('/reloadDashboardUserActive').get(reloadDashboardUserActive(models))
  route.route('/blastNotifikasi').put(blastNotifikasi())
  route.route('/setupConsumer').get(setupConsumer(models))
  route.route('/getUserNotifikasi').get(getUserNotifikasi(models))
  route.route('/exportExcel').get(exportExcel())
  route.route('/exportExcelConsumer').get(exportExcelConsumer())
  route.route('/testing').get(testing(models))
  route.route('/detailTransaksiOrder').post(detailTransaksiOrder())
  // ----- PLBBO ----- //
  route.route('/getBiodata').get(getBiodata())
  // ----- PLBBO ----- //
  
  return route;
}