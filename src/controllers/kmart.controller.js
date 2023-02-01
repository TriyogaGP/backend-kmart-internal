const { response, OK, NOT_FOUND, NO_CONTENT } = require('../utils/response.utils');
const { request } = require('../utils/request')
const { convertDateTime2, bulanValues } = require('../utils/helper.utils')
const excel = require("exceljs");
const _ = require("lodash");
const { DateTime } = require('luxon')
const dayjs = require('dayjs')
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

function hitManualKMart () {
  return async (req, res, next) => {
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}orders/webhook/transaction-success`,
				method: 'POST',
				data: {
					status: 'success',
					order_id: req.body.orderNumber,
					is_mydoc: '0'
				},
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataHarian () {
  return async (req, res, next) => {
		let { page, limit, startdate, enddate } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-data-harian?dateRange=${startdate},${enddate}&page=${page}&limit=${limit}`,
				method: 'GET',
				// params: { 
				// 	dateRange: `${startdate},${enddate}`,
				// 	page: page,
				// 	limit: limit,
				// },
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, { data: response.data.records, pageSummary: response.data.pageSummary });
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataOrder () {
  return async (req, res, next) => {
		let { page, limit, inv } = req.query
    try {
			let data, drop, hasil, url
			if(inv){
				data = _.split(inv, 'INV-').reverse()
				drop = _.dropRight(data)
				hasil = drop.map(val => {
					let kumpul = `INV-${val}`
					return kumpul
				})
				url = `&inv=${_.join(hasil, ',')}`
			}
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-data-harian?page=${page}&limit=${limit}${inv ? `${url}` : ''}`,
				method: 'GET',
				// params: { inv: `${_.join(hasil, ',')}` },
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, { data: response.data.records, pageSummary: response.data.pageSummary });
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getProductOrderSummary () {
  return async (req, res, next) => {
		let { idProductName, startdate, enddate, payment, shippingType } = req.query
    try {
			var url = ''
			if(startdate && enddate){ url += `dateRange=${startdate},${enddate}&` }
			if(idProductName){ url += `idProductName=${idProductName}&` }
			if(payment){ url += `payment=${payment}&` }
			if(shippingType){ url += `shippingType=${shippingType}&`}
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-summary-order?${url}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getProductVariant () {
  return async (req, res, next) => {
		let { productPackageCombination, inv, idProductPackage, kondisi } = req.query
    try {
			let url = `${KMART_BASE_URL}admin/orders/get-varian-product`
			if(kondisi == 1){
				const { data: response } = await request({
					url: `${url}`,
					method: 'GET',
					params: { productPackageCombination: `${productPackageCombination}` },
					headers: {
						// 'Authorization': `Bearer ${TOKEN}`,
						'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
					},
				})
				return OK(res, response.data);
			}
			if(kondisi == 2){
				let data = _.split(inv, 'INV-').reverse()
				let drop = _.dropRight(data)
				let hasil = drop.map(val => {
					let kumpul = `INV-${val}`
					return kumpul
				})
				const { data: response } = await request({
					url: `${url}`,
					method: 'GET',
					params: { inv: `${_.join(hasil, ',')}` },
					headers: {
						// 'Authorization': `Bearer ${TOKEN}`,
						'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
					},
				})
				return OK(res, response.data);
			}
			if(kondisi == 3){
				const { data: response } = await request({
					url: `${url}`,
					method: 'GET',
					params: { idProductPackage: idProductPackage },
					headers: {
						// 'Authorization': `Bearer ${TOKEN}`,
						'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
					},
				})
				return OK(res, response.data);
			}
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataNonCod () {
  return async (req, res, next) => {
		let { inv } = req.query
    try {
			let data = _.split(inv, 'INV-').reverse()
			let drop = _.dropRight(data)
			let hasil = drop.map(val => {
				let kumpul = `INV-${val}`
				return kumpul
			})
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-ordernoncod-stack`,
				method: 'GET',
				params: { orderID: `${_.join(hasil, ',')}` },
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function hitUpdateStatus () {
  return async (req, res, next) => {
		let { idOrder, status, remarks } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/update-status-noncod?orderId=${idOrder}&status=${status}&remarks=${remarks}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
		} catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataKmart () {
  return async (req, res, next) => {
		let { startdate, enddate, kode, kategoriProduct, Provinsi } = req.query
    try {
			const login = await loginKnet()
			const getBody = {
				dateFrom: startdate ? startdate : DateTime.local().plus({ day: -7 }).toISODate(),
				dateTo: enddate ? enddate : DateTime.local().plus({ day: -1 }).toISODate()
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

			if(kode === 'Transaksi Detail' && response.status === 'success' && response.resTransDetailPerDate.length > 0){
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

				return OK(res, { dataTransaksi: _.orderBy(dataTransaksi, 'transaksi.date', 'asc'), dataJumlah: jml });
			}

			if(kode === 'Transaksi Summary Detail' && response.status === 'success' && response.resSummByDate.length > 0){
				// let groupbyData = _.groupBy(response.resSummByDate, val => val.datetrans)

				// let kumpul = await Promise.all(Object.entries(groupbyData).map(val => {
				// 	let key = val[0]
				// 	let data = val[1]
				// 	let trx = []
				// 	data.map(v => {
				// 		trx.push({
				// 			transaksi: {
				// 				date: v.datetrans,
				// 				records: v.tot_rec,
				// 			},
				// 			total: {
				// 				dp: v.totDP,
				// 				bv: v.totBV,
				// 			},
				// 		})
				// 	})
				// 	return { key, trx }
				// })) 

				// let meta = {
				// 	records: 0,
				// 	dp: 0,
				// 	bv: 0,
				// }
				// let dataTransaksi = []
				// kumpul.map(async vall => {
				// 	dataTransaksi.push(...vall.trx)
				// 	await Promise.all(vall.trx.map(val => {
				// 		meta.records += val.transaksi.records
				// 		meta.dp += val.total.dp
				// 		meta.bv += val.total.bv
				// 	}))
				// })

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

				let result = _.chain(mappingTransaksi).groupBy("transaksi.date").toPairs().map(val => {
					return _.zipObject(['date', 'dataTrx'], val)
				}).value()

				let dataTransaksi = []
				await Promise.all(result.map(async val => {
					let jml = {
						dp: 0,
						bv: 0,
					}
					await Promise.all(val.dataTrx.map(vall => {
						jml.dp += vall.total.dp
						jml.bv += vall.total.bv
					}))
					dataTransaksi.push({
						total: {
							dp: jml.dp,
							bv: jml.bv
						},
						transaksi: {
							date: val.date,
							records: val.dataTrx.length
						}
					})
				}))

				let jml = {
					records: 0,
					dp: 0,
					bv: 0,
				}

				dataTransaksi.map(async val => {
					jml.records += val.transaksi.records
					jml.dp += val.total.dp
					jml.bv += val.total.bv
				});

				return OK(res, { dataTransaksi: _.orderBy(dataTransaksi, 'transaksi.date', 'asc'), dataJumlah: jml });
			}

			if(kode === 'Customer By Area' && response.status === 'success' && response.resCustomersByArea.length > 0){
				let dataCustomerSales = []
				let meta = { orders: 0 }
				response.resCustomersByArea.map(val => {
					if(Provinsi && Provinsi !== "") {
						if(val.province_name === Provinsi) {
							dataCustomerSales.push(val)
							meta.orders += val.tot_rec
						}
					}else{
						dataCustomerSales.push(val)
						meta.orders += val.tot_rec
					}
				})

				return OK(res, { dataCustomerSales: dataCustomerSales, dataJumlah: meta });
			}

			if(kode === 'Customer Sales By Area' && response.status === 'success' && response.resCustomerSalesByArea.length > 0){
				let meta = {
					orders: 0,
					dp: 0,
					cp: 0,
					bv: 0,
				}
				response.resCustomerSalesByArea.map(val => {
					meta.orders += val.tot_rec
					meta.dp += val.totDP
					meta.cp += val.totCP
					meta.bv += val.totBV
				})

				return OK(res, { dataCustomerSales: response.resCustomerSalesByArea, dataJumlah: meta });
			}

			if(kode === 'Transaksi Detail By Product' && response.status === 'success' && response.resTransByProductPerDate.length > 0){
				let groupbyData = _.groupBy(response.resTransByProductPerDate, val => val.datetrans)

				let kumpul = await Promise.all(Object.entries(groupbyData).map(val => {
					let key = val[0]
					let data = val[1]
					let trx = []
					data.map(v => {
						trx.push({
							transaksi: {
								period: v.bonusmonth,
								date: v.datetrans,
							},
							product: {
								code: v.prdcd,
								desc: v.prdnm,
								category: v.cat_desc,
							},
							qty: v.qty,
							price: {
								dp: v.dpr,
								cp: v.cpr,
								bv: v.bvr,
							},
							sub_total: {
								dp: v.total_dp,
								cp: v.total_cp,
								bv: v.total_bv,
							},
						})
					})
					return { key, trx }
				})) 

				let meta = {
					price: {
						dp: 0,
						cp: 0,
						bv: 0,
					},
					subtotal: {
						dp: 0,
						cp: 0,
						bv: 0,
					},
					qty: 0,
				}
				let dataTransaksiProduct = []
				await Promise.all(kumpul.map(async vall => {
					if(kategoriProduct && kategoriProduct !== "") {
						let subdataTransaksiProduct = []
						await Promise.all(vall.trx.map(val => {
							if(val.product.category === kategoriProduct) {
								subdataTransaksiProduct.push(val)

								meta.price.dp += val.price.dp
								meta.price.cp += val.price.cp
								meta.price.bv += val.price.bv

								meta.subtotal.dp += val.sub_total.dp
								meta.subtotal.cp += val.sub_total.cp
								meta.subtotal.bv += val.sub_total.bv
								
								meta.qty += val.qty
							}
						}))
						dataTransaksiProduct.push(...subdataTransaksiProduct)
					}else{
						dataTransaksiProduct.push(...vall.trx)
						await Promise.all(vall.trx.map(val => {
							meta.price.dp += val.price.dp
							meta.price.cp += val.price.cp
							meta.price.bv += val.price.bv

							meta.subtotal.dp += val.sub_total.dp
							meta.subtotal.cp += val.sub_total.cp
							meta.subtotal.bv += val.sub_total.bv
							
							meta.qty += val.qty
						}))
					}
				}))

				return OK(res, { dataTransaksiProduct: _.orderBy(dataTransaksiProduct, 'transaksi.date', 'asc'), dataJumlah: meta });
			}

			if(kode === 'Transaksi Detail Customer' && response.status === 'success' && response.resTransDetailPerDateCust.length > 0){
				let groupbyData = _.groupBy(response.resTransDetailPerDateCust, val => val.datetrans)

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

				return OK(res, { dataTransaksi: _.orderBy(dataTransaksi, 'transaksi.date', 'asc'), dataJumlah: meta });
			}

			if(kode === 'Transaksi Detail By Product Summary' && response.status === 'success' && response.resTransByProductSumm.length > 0){
				let cleanData = response.resTransByProductSumm.filter(v => v.prdcd !== null)

				let kumpul = await Promise.all(cleanData.map(val => {
					let trx = {
						product: {
							code: val.prdcd,
							desc: val.prdnm,
							category_id: val.cat_id,
							category_name: val.cat_desc,
						},
						qty: val.qty,
						price: {
							dp: val.dpr,
							cp: val.cpr,
							bv: val.bvr,
						},
						sub_total: {
							dp: val.total_dp,
							cp: val.total_cp,
							bv: val.total_bv,
						},
					}
					return trx
				}))

				let meta = {
					price: {
						dp: 0,
						cp: 0,
						bv: 0,
					},
					subtotal: {
						dp: 0,
						cp: 0,
						bv: 0,
					},
					qty: 0,
				}
				kumpul.map(async val => {
					meta.price.dp += val.price.dp
					meta.price.cp += val.price.cp
					meta.price.bv += val.price.bv

					meta.subtotal.dp += val.sub_total.dp
					meta.subtotal.cp += val.sub_total.cp
					meta.subtotal.bv += val.sub_total.bv
					
					meta.qty += val.qty
				})

				return OK(res, { dataTransaksiProduct: _.orderBy(kumpul, 'product.code', 'asc'), dataJumlah: meta });
			}
			
			return OK(res, 'Param tidak tersedia!');
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getDashboardTransaksi (models) {
  return async (req, res, next) => {
		let { tahun } = req.query
    try {
			const data = await models.Transaksi.findAll({
				where: { tahun: tahun },
				order: [
					['idTransaksi', 'ASC'],
				]
			});

			return OK(res, data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getDashboardUserActive (models) {
  return async (req, res, next) => {
		let { userType, bulan } = req.query
    try {
			const data = await models.UserActive.findAll({
				where: {
					userType: userType,
					bulan: bulan
				},
				order: [
					['idUserActive', 'ASC'],
				]
			});

			let dataKumpul = []
			await data.map(val => {
				let objectBaru = Object.assign(val.dataValues, {
					dataUser: val.dataValues.dataUser ? JSON.parse([val.dataValues.dataUser]) : []
				});
				return dataKumpul.push(objectBaru)
			})

			return OK(res, dataKumpul);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getDashboardProduct (models) {
  return async (req, res, next) => {
		let { kategori, is_package, condition, condition_value } = req.query
    try {
			let url = '';
			if(kategori == 'ALL') {
				url = `data=ALL&isPackage=${is_package}`
			}
			if(kategori == 'PART') {
				url = `data=PART&condition=${condition}&conditionValue${condition_value ? condition_value : null}`
			}
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/products/product-es?${url}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataConsumer () {
  return async (req, res, next) => {
		let {
			keyword,
			dateRange,
			isConsumer,
			limit,
			last = 1,
		} = req.query
    try {
			
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-user-consumer`,
				method: 'GET',
				params: {
					keyword: keyword,
					dateRange: dateRange,
					isConsumer: isConsumer,
					limit: limit,
					last: last,
				},
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getTopicUser (models) {
  return async (req, res, next) => {
		let { is_consumer, startdate, enddate, is_null } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-topic-by?dateRange=${startdate},${enddate}&isConsumer=${is_consumer}&isNull=${is_null}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getOrderUser (models) {
  return async (req, res, next) => {
		let { id_user, is_consumer } = req.query
    try {
			const idUser = id_user.split(',');
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-order-by?isConsumer=${is_consumer}&idUser=${idUser}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getTransaksiDetail (models) {
  return async (req, res, next) => {
		let { startdate, enddate } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-transaksi-detail?startdate=${startdate}&enddate=${enddate}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function blastNotifikasi (models) {
  return async (req, res, next) => {
		let { id_user } = req.query
		let { payload } = req.body
    try {
			if(!id_user) { return NOT_FOUND(res, 'ID User harap diisi !'); }
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/blast-notif?id_user=${id_user}`,
				method: 'PUT',
				data: {
					payload: {
						title: payload.title,
						body: payload.body,
						image: payload.image ? payload.image : null,
						screen: payload.screen,
						params: payload.params ? { id: payload.params } : {}
					}
				},
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res, response.data);
			// return OK(res, { id_user, payload: {
			// 			title: payload.title,
			// 			body: payload.body,
			// 			image: payload.image ? payload.image : null,
			// 			screen: payload.screen,
			// 			params: payload.params ? { id: payload.params } : {}
			// 	}});
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function setupConsumer (models) {
  return async (req, res, next) => {
		let { startdate, enddate, is_consumer, is_null } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}users/consumers/member/setup-consumer?dateRange=${startdate},${enddate}&isConsumer=${is_consumer}&isNull=${is_null}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})

			const { records } = response.data;

			await models.Setup.update({ dataJson: JSON.stringify(records) }, {where: { kategori: 'USER' }})

			return OK(res, records);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getUserNotifikasi (models) {
  return async (req, res, next) => {
    try {
			const data = await models.Setup.findOne({ where: { kategori: 'USER' } });

			return OK(res, JSON.parse(data.dataJson));
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

// function getDetailUserActive (models) {
//   return async (req, res, next) => {
// 		let { page = 1, limit = 20, isMember, detail, bulan } = req.query
//     try {
// 			const mappingbulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
// 			let bulanNum = _.indexOf(mappingbulan, bulan) + 1
// 			bulanNum = bulanNum >= 10 ? bulanNum : "0"+bulanNum
// 			let tahun = new Date().getFullYear()
// 			let jumlah_hari = new Date(tahun, bulanNum, 0).getDate()
// 			const getBody = {
// 				dateFrom: dayjs(tahun+"-"+bulanNum+"-01").toJSON(),
// 				dateTo: dayjs(tahun+"-"+bulanNum+"-"+jumlah_hari).toJSON()
// 			}

// 			// const { data: response } = await request({
// 			// 	url: `${KMART_BASE_URL}admin/orders/get-user-active?page=${page}&limit=${limit}&dateRange=${getBody.dateFrom},${getBody.dateTo}&isMember=${isMember}&detail=${detail}`,
// 			// 	method: 'GET',
// 			// 	headers: {
// 			// 		// 'Authorization': `Bearer ${TOKEN}`,
// 			// 		'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
// 			// 	},
// 			// })
// 			// const { records, pageSummary } = response.data

// 			// return OK(res, { records, pageSummary });
// 			return OK(res, { getBody, url: `${KMART_BASE_URL}admin/orders/get-user-active?page=${page}&limit=${limit}&dateRange=${getBody.dateFrom},${getBody.dateTo}&isMember=${isMember}&detail=${detail}` });
//     } catch (err) {
// 			return NOT_FOUND(res, err.message)
//     }
//   }  
// }

function reloadDashboardTransaksi (models) {
  return async (req, res, next) => {
		let { tahun } = req.query
    try {
			// let tahun = new Date().getFullYear()
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
			const login = await loginKnet()
			for(let i=1; i <= 12; i++) {
				let jumlah_hari = new Date(tahun, i, 0).getDate()
				let bulan = i >= 10 ? i : "0"+i
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

			return OK(res, hasil);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function reloadDashboardUserActive (models) {
  return async (req, res, next) => {
		let { isMember, detail } = req.query
    try {
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

			return OK(res, hasil);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function exportExcel () {
  return async (req, res, next) => {
		let { startdate, enddate, limit, totalPages } = req.query
    try {
			let workbook = new excel.Workbook();
			for (let index = 1; index <= totalPages; index++) {
				const { data: response } = await request({
					url: `${KMART_BASE_URL}admin/orders/get-data-harian?dateRange=${startdate},${enddate}&page=${index}&limit=${limit}`,
					method: 'GET',
					// params: { dateRange: `${startdate},${enddate}` },
					headers: {
						// 'Authorization': `Bearer ${TOKEN}`,
						'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
					},
				})
	
				let kumpuldata = []
				const { records } = response.data
				records.map(val => {
					let emit = {
						orderNumber: val.orderNumber,
						createdAt: convertDateTime2(val.createdAt),
						shippingReceiptNumber: val.shippingReceiptNumber,
						orderStatusLatest: val.orderStatusLatest,
						shippingType: val.shippingType,
						carrierName: val.carrierName,
						Product: val.productDetails[0].name,
						namaPembeli: val.dataUser.consumerType != 'MEMBER' ? val.dataMember.fullname : val.dataUser.fullname,
						notelpPembeli: val.dataUser.consumerType != 'MEMBER' ? val.dataMember.devicenumber : val.dataUser.devicenumber,
						memberRefCode: val.dataUser.customerRegRefcode,
						namaReferal: val.dataUser.consumerType != 'MEMBER' ? val.dataMember.fullname : '',
						telpReferal: val.dataUser.consumerType != 'MEMBER' ? val.dataMember.devicenumber : '',
					}
					kumpuldata.push(emit)
				})
	
				let worksheet = workbook.addWorksheet(`Data Order${index > 1 ? ` - Page ${index}` : '' }`);
				worksheet.columns = [
					{ header: "Invoice", key: "orderNumber", width: 20 },
					{ header: "Tanggal Order", key: "createdAt", width: 20 },
					{ header: "Product", key: "Product", width: 50 },
					{ header: "Kurir", key: "carrierName", width: 10 },
					{ header: "No Resi", key: "shippingReceiptNumber", width: 20 },
					{ header: "Nama Pembeli", key: "namaPembeli", width: 20 },
					{ header: "Telepon Pembeli", key: "notelpPembeli", width: 20 },
					{ header: "Member Ref Code", key: "memberRefCode", width: 20 },
					{ header: "Status", key: "orderStatusLatest", width: 20 },
					{ header: "COD / NON COD", key: "shippingType", width: 20 },
					{ header: "Nama Referal", key: "namaReferal", width: 20 },
					{ header: "Kontak Referal", key: "telpReferal", width: 20 },
				];
				const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
				figureColumns.forEach((i) => {
					worksheet.getColumn(i).alignment = { horizontal: "left" };
				});
				worksheet.addRows(kumpuldata);
				worksheet.state = 'visible';
			}

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
		
			return workbook.xlsx.write(res).then(function () {
				res.status(200).end();
			});
			// return OK(res, kumpuldata)
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function exportExcelConsumer () {
  return async (req, res, next) => {
		let { dataOrder } = req.query
    try {
			let records = JSON.parse(dataOrder)

			// let records = await Promise.all(dataKumpul.map(async val => {
			// 	let dataorder = await Promise.all(val.dataOrders.map(async val1 => {
			// 		let dataproduct = await Promise.all(val1.productDetails.map(val2 => {
			// 			return `${val2.name} (${val2.quantity})`
			// 		}))
			// 		return `${val1.orderNumber} - ${dataproduct}`
			// 	}))
			// 	return {
			// 		name: val.name,
			// 		email: val.email,
			// 		deviceNumber: val.deviceNumber,
			// 		product: dataorder.join('; '),
			// 	}
			// }))

			let workbook = new excel.Workbook();
			let worksheet = workbook.addWorksheet(`List Data`);
			worksheet.columns = [
				{ header: "Nama Pembeli", key: "name", width: 20 },
				{ header: "Email Pembeli", key: "email", width: 20 },
				{ header: "Telepon Pembeli", key: "deviceNumber", width: 20 },
				// { header: "Product", key: "product", width: 20 },
			];
			const figureColumns = [1, 2, 3];
			figureColumns.forEach((i) => {
				worksheet.getColumn(i).alignment = { horizontal: "left" };
			});
			worksheet.addRows(records);
			worksheet.state = 'visible';
			
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
		
			return workbook.xlsx.write(res).then(function () {
				res.status(200).end();
			});
			// return OK(res, dataOrder)
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function testing (models) {
  return async (req, res, next) => {
		// let { startdate, enddate, kode, kategoriProduct } = req.query
    try {
			let tahun = new Date().getFullYear()
			// let tahun = '2023'
			let hasil = []
			const login = await loginKnet()
			for(let i=1; i <= 12; i++) {
				let jumlah_hari = new Date(tahun, i, 0).getDate()
				let bulan = i >= 10 ? i : "0"+i
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

			return OK(res, hasil);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

module.exports = {
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
  // getDetailUserActive,
  reloadDashboardTransaksi,
  reloadDashboardUserActive,
  exportExcel,
  exportExcelConsumer,
  testing,
}