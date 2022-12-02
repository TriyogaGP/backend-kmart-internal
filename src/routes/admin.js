const { Router } = require('express');
const {body, checkSchema, validationResult} = require('express-validator');
const {
  getAdmin,
  crudAdmin,
} = require('../controllers/admin.controller')

module.exports = models => {
  const route = Router();

  route.route('/getAdmin').get(getAdmin(models))
  route.route('/postAdmin').post(crudAdmin(models))
  
  return route;
}