const { Router } = require('express');
const {
  hitManualKMart,
  getdataHarian,
  getdataOrder,
  exportExcel,
  getdataNonCod,
  hitUpdateStatus,
  getdataKmart,
  testing,
} = require('../controllers/kmart.controller')
const { verifyToken } = require('../middleware/VerifyToken');

module.exports = models => {
  const route = Router();
  route.route('/hitManualKMart').post(verifyToken, hitManualKMart())
  route.route('/getdataHarian').get(verifyToken, getdataHarian())
  route.route('/getdataOrder').get(verifyToken, getdataOrder())
  route.route('/getdataNonCod').get(verifyToken, getdataNonCod())
  route.route('/hitUpdateStatus').get(verifyToken, hitUpdateStatus())
  route.route('/exportExcel').get(exportExcel())
  route.route('/getdataKmart').get(verifyToken, getdataKmart())
  route.route('/testing').get(testing())
  
  return route;
}