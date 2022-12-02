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
  route.route('/hitManualKMart').post(hitManualKMart())
  route.route('/getdataHarian').get(getdataHarian())
  route.route('/getdataOrder').get(getdataOrder())
  route.route('/getdataNonCod').get(getdataNonCod())
  route.route('/hitUpdateStatus').get(hitUpdateStatus())
  route.route('/exportExcel').get(exportExcel())
  route.route('/getdataKmart').get(getdataKmart())
  route.route('/testing').get(testing())
  
  return route;
}