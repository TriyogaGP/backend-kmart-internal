const { request } = require('../utils/request')
const { bulanValues } = require('../utils/helper.utils')
const _ = require("lodash");
const dayjs = require('dayjs');
const dotenv = require('dotenv');
dotenv.config();
const KMART_BASE_URL = 'https://kld-api-stg.k-mart.co.id/v1/'
const KNET_BASE_URL = 'https://api.k-link.dev/api/'
const TOKEN = process.env.TOKEN
const XINTERSERVICECALL = process.env.XINTERSERVICECALL

async function loginKnet () {
	const { data: login } = await request({
		url: `${KNET_BASE_URL}auth/login`,
		method: 'POST',
		data: {
			username: 'app.k-mart2.0_dev',
			password: 'app.k-mart2.0_dev@202103'
		},
		headers: {
			'Content-Type': 'application/json'
		},
	})
	return login
}

async function cronTransaksi (models) {
	let tahun = new Date().getFullYear()
	const data = await models.Transaksi.findAll({
		where: { tahun: tahun },
		order: [
			['idTransaksi', 'ASC'],
		]
	});
	if(!data.length) {
		const payload = [
			{ tahun: tahun, bulan: 'Januari', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Februari', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Maret', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'April', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Mei', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Juni', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Juli', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Agustus', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'September', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Oktober', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'November', dp: '0', bv: '0' },
			{ tahun: tahun, bulan: 'Desember', dp: '0', bv: '0' },
		]
		await models.Transaksi.bulkCreate(payload)
	}
	let hasil = []
	for(let i=1; i <= 12; i++) {
		let jumlah_hari = new Date(tahun, i, 0).getDate()
		let bulan = i >= 10 ? i : "0"+i
		const login = await loginKnet()
		const getBody = {
			dateFrom: tahun+"-"+bulan+"-01",
			dateTo: tahun+"-"+bulan+"-"+jumlah_hari
		}
		const { data: response } = await request({
			url: `${KNET_BASE_URL}v.1/getKMartData`,
			method: 'POST',
			data: getBody,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${login.token}`,
			},
		})

		if(response){
			console.log("bulan "+bulanValues(tahun+"-"+i+"-01"));
			let groupbyData = _.groupBy(response.resTransDetailPerDate, val => val.datetrans)

			let kumpul = await Promise.all(Object.entries(groupbyData).map(val => {
				let key = val[0]
				let data = val[1]
				let trx = []
				data.map(v => {
					trx.push({
						orderNumber: v.token,
						transaksi: {
							period: v.bonusmonth,
							date: v.datetrans,
							order_no: v.orderno,
							reff_no: v.token,
						},
						distributor: {
							code: v.id_memb,
							name: v.nmmember,
						},
						total: {
							dp: v.totPayDP,
							bv: v.total_bv,
						},
					})
				})
				return { key, trx }
			})) 

			let meta = {
				dp: 0,
				bv: 0,
			}
			let dataKumpulTransaksi = []
				kumpul.map(async vall => {
					dataKumpulTransaksi.push(...vall.trx)
					await Promise.all(vall.trx.map(val => {
						meta.dp += val.total.dp
						meta.bv += val.total.bv
					}))
				})

				const PATTERN = /INV-RS/
				const mappingTransaksi = dataKumpulTransaksi.filter(str => !PATTERN.test(str.orderNumber))
				
				let jml = {
					dp: 0,
					bv: 0,
				}

				let dataTransaksi = []
				await Promise.all(mappingTransaksi.map(async val => {
					jml.dp += val.total.dp
					jml.bv += val.total.bv
					dataTransaksi.push(val)
				}))

				hasil.push({
					bulan: bulanValues(tahun+"-"+i+"-01"),
					dataJumlah: jml
				})
		}
	}
	hasil.map(async val => {
		let kirimdata = { 
			tahun: tahun,
			bulan: val.bulan,
			dp: val.dataJumlah.dp,
			bv: val.dataJumlah.bv
			}
		await models.Transaksi.update(kirimdata, {where: { bulan: val.bulan, tahun: tahun }})
	})

	return 'success'
}

async function cronUserActive (models, isMember, detail) {
	let tahun = new Date().getFullYear()
	let hasil = []
	for(let i=1; i <= 12; i++) {
		let jumlah_hari = new Date(tahun, i, 0).getDate()
		let bulan = i >= 10 ? i : "0"+i
		const getBody = {
			dateFrom: dayjs(tahun+"-"+bulan+"-01").toJSON(),
			dateTo: dayjs(tahun+"-"+bulan+"-"+jumlah_hari).toJSON()
		}

		const { data: response } = await request({
			url: `${KMART_BASE_URL}admin/orders/get-user-active?dateRange=${getBody.dateFrom},${getBody.dateTo}&isMember=${isMember}&detail=${detail}`,
			method: 'GET',
			headers: {
				// 'Authorization': `Bearer ${TOKEN}`,
				'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
			},
		})

		if(response){
			hasil.push({
				bulan: bulanValues(tahun+"-"+i+"-01"),
				data: response.data.records
			})
		}
	}

	hasil.map(async val => {
		let kirimdata = { 
			userType: isMember == 0 ? 'Customer' : 'Member',
			tahun: tahun,
			bulan: val.bulan,
			dataUser: JSON.stringify(val.data),
			}
		await models.UserActive.update(kirimdata, {where: { userType: isMember == 0 ? 'Customer' : 'Member', bulan: val.bulan }})
	})

	return 'success';
}

module.exports = {
	cronTransaksi,
	cronUserActive,
}