const { response, OK, NOT_FOUND, NO_CONTENT } = require('../utils/response.utils');
const { 
	_buildResponseMenu, 
	_buildResponseKurir, 
	_buildResponseLoggerAdmin, 
	_buildResponseLoggerPeserta 
} = require('../utils/build-response');
const { encrypt, decrypt, convertDateTime } = require('../utils/helper.utils')
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const { logger } = require('../configs/db.winston')
const dotenv = require('dotenv');
dotenv.config();
const BASE_URL = process.env.BASE_URL

function getEncrypt () {
  return async (req, res, next) => {
		let { kata } = req.query;
    try {
      let dataEncrypt = {
				asli: kata,
				hasil: encrypt(kata)
			}

			// logger.info(JSON.stringify({ message: dataEncrypt, level: 'info', timestamp: new Date() }), {route: '/settings/encryptPass'});
			return OK(res, dataEncrypt);
    } catch (err) {
			// logger.error(JSON.stringify({ message: err.message, level: 'error', timestamp: new Date() }), {route: '/settings/encryptPass'});
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getDecrypt () {
  return async (req, res, next) => {
		let { kata } = req.query;
    try {
      let dataDecrypt = {
				asli: kata,
				hasil: decrypt(kata)
			}
			return OK(res, dataDecrypt);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getMenu (models) {
  return async (req, res, next) => {
		let { kategori } = req.query
		let where = {}
    try {
			if(kategori) {
				where.kategori = kategori
			}
      const dataMenu = await models.Menu.findAll({
				where,
				order: [['kategori', 'DESC'],['menuSequence', 'ASC'],]
			});
			return OK(res, dataMenu);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function crudMenu (models) {
  return async (req, res, next) => {
		let body = { ...req.body }
		let where = {}
    try {
			if(body.jenis == 'ADD'){
				where = { 
					statusAktif: true,
					[Op.or]: [
						{ menuRoute: body.menu_route },
						{ menuText: body.menu_text }
					]
				}
				const {count, rows} = await models.Menu.findAndCountAll({where});
				if(count) return NOT_FOUND(res, 'data sudah di gunakan !')
				let dataCek = await models.Menu.findOne({where: {kategori: body.kategori}, limit: 1, order: [['idMenu', 'DESC']]})
				let urutan = dataCek.menuSequence + 1
				kirimdata = {
					kategori: body.kategori,
					menuRoute: body.menu_route,
					menuText: body.menu_text,
					menuIcon: body.menu_icon,
					menuSequence: urutan,
					statusAktif: 1,
				}
				await models.Menu.create(kirimdata)
			}else if(body.jenis == 'EDIT'){
				if(await models.Menu.findOne({where: {[Op.or]: [{menuRoute: body.menu_route},{menuText: body.menu_text}], [Op.not]: [{idRole: body.id_role}]}})) return NOT_FOUND(res, 'Menu Route atau Menu Text sudah di gunakan !')
				kirimdata = {
					kategori: body.kategori,
					menuRoute: body.menu_route,
					menuText: body.menu_text,
					menuIcon: body.menu_icon,
					statusAktif: 1,
				}
				await models.Menu.update(kirimdata, { where: { idMenu: body.id_menu } })
			}else if(body.jenis == 'DELETE'){
				kirimdata = {
					statusAktif: 0
				}
				await models.Menu.update(kirimdata, { where: { idMenu: body.id_menu } })	
			}else if(body.jenis == 'STATUSRECORD'){
				kirimdata = { 
					statusAktif: body.status_aktif 
				}
				await models.Menu.update(kirimdata, { where: { idMenu: body.id_menu } })
			}else{
				return NOT_FOUND(res, 'terjadi kesalahan pada sistem !')
			}

			return OK(res);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getRole (models) {
  return async (req, res, next) => {
    try {
      const dataRole = await models.Role.findAll();
			return OK(res, dataRole);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function crudRole (models) {
  return async (req, res, next) => {
		let body = { ...req.body }
		let where = {}
    try {
			if(body.jenis == 'ADD'){
				where = { 
					status: true,
					namaRole: body.nama_role
				}
				const {count, rows} = await models.Role.findAndCountAll({where});
				if(count) return NOT_FOUND(res, 'data sudah di gunakan !')
				kirimdata = {
					namaRole: body.nama_role,
					status: 1,
				}
				let kirim = await models.Role.create(kirimdata)
				if(kirim){
					let data = await models.Role.findOne({where: {namaRole: body.nama_role}})
					let sendData = {
						idRole: data.idRole,
						menu: '',
					}
					await models.RoleMenu.create(sendData)
				}
			}else if(body.jenis == 'EDIT'){
				if(await models.Role.findOne({where: {namaRole: body.nama_role, [Op.not]: [{idRole: body.id_role}]}})) return NOT_FOUND(res, 'Nama Role sudah di gunakan !')
				kirimdata = {
					namaRole: body.nama_role,
					status: 1,
				}
				await models.Role.update(kirimdata, { where: { idRole: body.id_role } })
			}else if(body.jenis == 'DELETE'){
				kirimdata = {
					status: 0
				}
				await models.Role.update(kirimdata, { where: { idRole: body.id_role } })	
			}else if(body.jenis == 'STATUSRECORD'){
				kirimdata = { 
					status: body.status 
				}
				await models.Role.update(kirimdata, { where: { idRole: body.id_role } })
			}else{
				return NOT_FOUND(res, 'terjadi kesalahan pada sistem !')
			}

			return OK(res);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getRoleMenu (models) {
  return async (req, res, next) => {
    let { id_role } = req.query
		let where = {}
    try {
			if(id_role) {
				where.idRole = id_role
			}
      const dataRoleMenu = await models.RoleMenu.findAll({
				where,
				include: [
					{ 
						model: models.Role,
						attributes: ['namaRole'],
						where: { status: true }
					}
				]
			});
			let dataKumpul = []
			await dataRoleMenu.map(val => {
				let obj = {
					idRoleMenu: val.dataValues.idRoleMenu,
					idRole: val.dataValues.idRole,
					namaRole: val.dataValues.Role.namaRole
				}
				let objectBaru = Object.assign(obj, {
					menu: val.dataValues.menu ? JSON.parse([val.dataValues.menu]) : []
				});
				return dataKumpul.push(objectBaru)
			})
			
			let result = await Promise.all(dataKumpul.map(async value => {
				let kumpul = await Promise.all(value.menu.map(async val => {
					const dataMenu = await models.Menu.findOne({
						where: { idMenu: val.idMenu }
					});
					let objectBaru = Object.assign(val, {
						menuRoute: dataMenu.menuRoute,
						menuText: dataMenu.menuText,
						menuIcon: dataMenu.menuIcon,
						statusAktif: dataMenu.statusAktif,
					});
					return objectBaru
				}))
				let objectBaru = Object.assign(value, { menu: kumpul.filter(value => value.statusAktif) });
				return objectBaru
			}))


			return OK(res, result);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function crudRoleMenu (models) {
  return async (req, res, next) => {
		let body = { ...req.body }
    try {
			kirimdata = {
				idRole: body.id_role,
				menu: JSON.stringify(body.menu),
			}
			await models.RoleMenu.update(kirimdata, { where: { idRoleMenu: body.id_role_menu } })
			return OK(res);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getWilayah (models) {
  return async (req, res, next) => {
		let { bagian, KodeWilayah } = req.query
		let jmlString = bagian == 'provinsi' ? 2 : bagian == 'kabkotaOnly' ? 5 : KodeWilayah.length
		let whereChar = (jmlString==2?5:(jmlString==5?8:13))
    let where = {}
		try {
			if(bagian == 'provinsi' || bagian == 'kabkotaOnly') {
				where = sequelize.where(sequelize.fn('char_length', sequelize.col('kode')), jmlString)
			}else{
				where = { 
					[Op.and]: [
						sequelize.where(sequelize.fn('char_length', sequelize.col('kode')), whereChar),
						{
							kode: {
								[Op.like]: `${KodeWilayah}%`
							}
						}
					]
				}
			}
			const dataWilayah = await models.Wilayah.findAll({
				where,
				attributes: [['kode', 'value'], ['nama', 'text'], 'kodePos']
			});

			return OK(res, dataWilayah);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

module.exports = {
  getEncrypt,
  getDecrypt,
  getMenu,
  crudMenu,
  getRole,
  crudRole,
  getRoleMenu,
  crudRoleMenu,
  getWilayah,
}