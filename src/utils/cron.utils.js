const { request } = require('../utils/request')
const { bulanValues } = require('../utils/helper.utils')
const _ = require("lodash");
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
			let dataTransaksi = []
			kumpul.map(async vall => {
				dataTransaksi.push(...vall.trx)
				await Promise.all(vall.trx.map(val => {
					meta.dp += val.total.dp
					meta.bv += val.total.bv
				}))
			})

			hasil.push({
				bulan: bulanValues(tahun+"-"+i+"-01"),
				dataJumlah: meta
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
		await models.Transaksi.update(kirimdata, {where: { bulan: val.bulan }})
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
			dateFrom: tahun+"-"+bulan+"-01",
			dateTo: tahun+"-"+bulan+"-"+jumlah_hari
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