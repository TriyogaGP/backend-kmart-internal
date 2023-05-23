const { Router } = require('express');
const {body, checkSchema, validationResult} = require('express-validator');
const {
  getAdmin,
  crudAdmin,
  getBeritaAcara,
  crudBeritaAcara,
  pdfCreate,
} = require('../controllers/admin.controller')

module.exports = models => {
  const route = Router();

  route.route('/Admin')
    .get(getAdmin(models))
    .post(crudAdmin(models))
  route.route('/BeritaAcara')
    .get(getBeritaAcara(models))
    .post(crudBeritaAcara(models))
  route.route('/PDF/:idBeritaAcara')
    .get(pdfCreate(models))
  
  return route;
}