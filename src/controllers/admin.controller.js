const { response, OK, NOT_FOUND, NO_CONTENT } = require('../utils/response.utils');
const { encrypt, decrypt, buildMysqlResponseWithPagination, convertDateTime } = require('../utils/helper.utils');
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const { logger } = require('../configs/db.winston')
const nodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL

function getAdmin (models) {
  return async (req, res, next) => {
		let { sort, page = 1, limit = 10, keyword } = req.query
    let where = {}
		let order = []
    try {
			const OFFSET = page > 0 ? (page - 1) * parseInt(limit) : undefined
			order = [
				['createdAt', sort ? sort : 'ASC'],
			]

			const whereKey = keyword ? {
				[Op.or]: [
					{ nama : { [Op.like]: `%${keyword}%` }},
					{ username : { [Op.like]: `%${keyword}%` }},
					{ email : { [Op.like]: `%${keyword}%` }},
				]
			} : {}

			where = whereKey

      const { count, rows: dataAdmin } = await models.Admin.findAndCountAll({
				where,
				attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
				order,
				limit: parseInt(limit),
				offset: OFFSET,
			});

			const getResult = await Promise.all(dataAdmin.map(async (val) => {
				let dataRole = await models.Role.findOne({
					where: { idRole: val.level },
					attributes: ['namaRole'],
				});
	
				let dataKumpul = Object.assign(val.dataValues, {
					namaRole: dataRole.namaRole,
				})
				return dataKumpul;
			}))

			const responseData = buildMysqlResponseWithPagination(
				getResult,
				{ limit, page, total: count }
			)

			return OK(res, responseData);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function crudAdmin (models) {
  return async (req, res, next) => {
		let body = { ...req.body }
		let where = {}
    try {
			let salt, hashPassword, kirimdata;
			if(body.jenis == 'ADD'){
				where = { 
					statusAktif: true,
					[Op.or]: [
						{ email: body.email },
						{ username: body.username }
					] 
				}
				const {count, rows} = await models.Admin.findAndCountAll({where});
				if(count) return NOT_FOUND(res, 'data sudah di gunakan !')
				salt = await bcrypt.genSalt();
				hashPassword = await bcrypt.hash(body.password, salt);
				kirimdata = {
					level: body.level,
					downline_tenant: body.downline_tenant,
					nama: body.nama,
					email: body.email,
					username: body.username,
					password: hashPassword,
					kataSandi: encrypt(body.password),
					kota: body.kota,
					noHP: body.no_hp,
					alamat: body.alamat,
					statusAktif: 1,
					createBy: body.create_update_by,
				}
				await models.Admin.create(kirimdata)
			}else if(body.jenis == 'EDIT'){
				if(await models.Admin.findOne({where: {email: body.email, [Op.not]: [{idAdmin: body.id_admin}]}})) return NOT_FOUND(res, 'email sudah di gunakan !')
				if(await models.Admin.findOne({where: {username: body.username, [Op.not]: [{idAdmin: body.id_admin}]}})) return NOT_FOUND(res, 'username sudah di gunakan !')
				const data = await models.Admin.findOne({where: {idAdmin: body.id_admin}});
				salt = await bcrypt.genSalt();
				let decryptPass = data.kataSandi != body.password ? body.password : decrypt(body.password)
				hashPassword = await bcrypt.hash(decryptPass, salt);
				kirimdata = {
					downline_tenant: body.downline_tenant,
					level: body.level,
					nama: body.nama,
					email: body.email,
					username: body.username,
					password: hashPassword,
					kataSandi: data.kataSandi == body.password ? body.password : encrypt(body.password),
					kota: body.kota,
					noHP: body.no_hp,
					alamat: body.alamat,
					statusAktif: 1,
					updateBy: body.create_update_by,
				}
				await models.Admin.update(kirimdata, { where: { idAdmin: body.id_admin } })
			}else if(body.jenis == 'DELETE'){
				kirimdata = {
					statusAktif: 0,
					deleteBy: body.delete_by,
					deletedAt: new Date(),
				}
				await models.Admin.update(kirimdata, { where: { idAdmin: body.id_admin } })	
			}else if(body.jenis == 'STATUSRECORD'){
				kirimdata = { 
					statusAktif: body.status_aktif, 
					updateBy: body.create_update_by 
				}
				await models.Admin.update(kirimdata, { where: { idAdmin: body.id_admin } })
			}else{
				return NOT_FOUND(res, 'terjadi kesalahan pada sistem !')
			}

			return OK(res);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getBeritaAcara (models) {
  return async (req, res, next) => {
		let { sort, page = 1, limit = 10, keyword } = req.query
    let where = {}
		let order = []
    try {
			const OFFSET = page > 0 ? (page - 1) * parseInt(limit) : undefined
			order = [
				['createdAt', sort ? sort : 'DESC'],
			]

			const whereKey = keyword ? {
				orderNumber : { [Op.like]: `%${keyword}%` }
			} : {}

			where = whereKey

      const { count, rows: dataBeritaAcara } = await models.BeritaAcara.findAndCountAll({
				where,
				order,
				limit: parseInt(limit),
				offset: OFFSET,
			});

			const responseData = buildMysqlResponseWithPagination(
				dataBeritaAcara,
				{ limit, page, total: count }
			)

			return OK(res, responseData);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function crudBeritaAcara (models) {
  return async (req, res, next) => {
		let body = { ...req.body }
		let where = {}
    try {
			let kirimdata;
			if(body.jenis == 'ADD'){
				where = { orderNumber: body.order_number }
				const {count, rows} = await models.BeritaAcara.findAndCountAll({where});
				if(count) return NOT_FOUND(res, 'data sudah di gunakan !')
				kirimdata = {
					orderNumber: body.order_number,
					penjelasan: body.penjelasan,
					requestBy: body.request_by,
					createBy: body.create_update_by,
				}
				await models.BeritaAcara.create(kirimdata)
			}else if(body.jenis == 'EDIT'){
				if(await models.BeritaAcara.findOne({where: {orderNumber: body.order_number, [Op.not]: [{idBeritaAcara: body.id_berita_acara}]}})) return NOT_FOUND(res, 'order number sudah di gunakan !')
				kirimdata = {
					orderNumber: body.order_number,
					penjelasan: body.penjelasan,
					requestBy: body.request_by,
					updateBy: body.create_update_by,
				}
				await models.BeritaAcara.update(kirimdata, { where: { idBeritaAcara: body.id_berita_acara } })
			}else{
				return NOT_FOUND(res, 'terjadi kesalahan pada sistem !')
			}

			return OK(res);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function pdfCreate (models) {
	return async (req, res, next) => {
		let { idBeritaAcara } = req.params
		try {			
			const dataBeritaAcara = await models.BeritaAcara.findOne({
				where: { idBeritaAcara },
			});

			const hasil = {
				url: BASE_URL,
				idBeritaAcara: dataBeritaAcara.idBeritaAcara,
				orderNumber: dataBeritaAcara.orderNumber,
				penjelasan: dataBeritaAcara.penjelasan,
				requestBy: dataBeritaAcara.requestBy,
				createdAt: convertDateTime(dataBeritaAcara.createdAt),
			}
			// return OK(res, hasil)
			ejs.renderFile(path.join(__dirname, "../../src/views/viewBerita.ejs"), { dataBeritaAcara: hasil }, (err, data) => {
				if (err) {
					console.log(err);
				} else {
					// console.log(data)
					let options = {
						format: "A4",
						orientation: "portrait",
						quality: "10000",
						border: {
							top: "2cm",
							right: "2cm",
							bottom: "2cm",
							left: "2cm"
						},
						// header: {
						// 	height: "12mm",
						// },
						// footer: {
						// 	height: "15mm",
						// },
						httpHeaders: {
							"Content-type": "application/pdf",
						},
						type: "pdf",
					};
					pdf.create(data, options).toStream(function(err, stream){
						stream.pipe(res);
					});
				}
			});
		} catch (err) {
			return NOT_FOUND(res, err.message)
		}
	}
}

module.exports = {
  getAdmin,
  crudAdmin,
  getBeritaAcara,
  crudBeritaAcara,
  pdfCreate,
}