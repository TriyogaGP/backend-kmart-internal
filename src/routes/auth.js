const { Router } = require('express');
const { verifyToken } = require('../middleware/VerifyToken');
const {
  loginAdmin,
  forgotPass,
  ubahKataSandi,
  getProfile,
} = require('../controllers/auth.controller')

module.exports = models => {
  const route = Router();

  route.route('/loginAdmin').post(loginAdmin(models))
  route.route('/forgotPass').post(forgotPass(models))
  route.route('/ubahKataSandi').post(verifyToken, ubahKataSandi(models))
  route.route('/getProfile').get(verifyToken, getProfile(models))
  
  return route;
}