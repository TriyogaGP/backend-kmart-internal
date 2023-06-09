const { response, OK, NOT_FOUND, NO_CONTENT } = require('../utils/response.utils');
const { request } = require('../utils/request')
const { convertDateTime2, dateconvert, bulanValues } = require('../utils/helper.utils')
const excel = require("exceljs");
const _ = require("lodash");
const { DateTime } = require('luxon')
const dayjs = require('dayjs')
const dotenv = require('dotenv');
dotenv.config();
const KMART_BASE_URL = 'https://kld-api-stg.k-mart.co.id/v1/'
const KNET_BASE_URL = 'https://api.k-link.dev/api/'
const PLBBO_BASE_URL = 'https://plbbo.akademiinspiradzi.com/wp-json/v1/'
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
				data = _.split(inv, 'INV').reverse()
				drop = _.dropRight(data)
				hasil = drop.map(val => {
					let kumpul = `INV${val}`
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
		let { startdate, enddate, payment, shippingType } = req.query
		let { idProductSync } = req.body
    try {
			// return OK(res, idProductSync);
			var url = ''
			if(startdate && enddate){ url += `dateRange=${startdate},${enddate}&` }
			// if(idProductName){ url += `idProductName=${idProductName}&` }
			if(payment){ url += `payment=${payment}&` }
			if(shippingType){ url += `shippingType=${shippingType}&`}
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-summary-order?${url}`,
				method: 'PUT',
				data: {
					idProductSync
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
				let data = _.split(inv, 'INV').reverse()
				let drop = _.dropRight(data)
				let hasil = drop.map(val => {
					let kumpul = `INV${val}`
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
			let data = _.split(inv, 'INV').reverse()
			let drop = _.dropRight(data)
			let hasil = drop.map(val => {
				let kumpul = `INV${val}`
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
		let { status, remarks } = req.query
		let { idOrder } = req.body
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/update-status-noncod?status=${status}&remarks=${remarks}`,
				method: 'PUT',
				data: {
					orderId: idOrder
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

function hitCartEmpty () {
  return async (req, res, next) => {
    try {
			await request({
				url: `${KMART_BASE_URL}admin/orders/get-cart-orders?view=0`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			return OK(res);
		} catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getdataKmart () {
  return async (req, res, next) => {
		let { startdate, enddate, kode, kategoriProduct, Provinsi, sort = '' } = req.query
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

				let sorting = JSON.parse(sort)
				if(sorting.sortBy.length){
					let fieldName = await Promise.all(sorting.sortBy.map(val => {
						const hasil = []
						if(val == 'date' || val == 'reff_no'){
							hasil.push(`transaksi.${val}`)
						}else if(val == 'code' || val == 'name'){
							hasil.push(`distributor.${val}`)
						}else if(val == 'dp' || val == 'bv'){
							hasil.push(`total.${val}`)
						}
						return hasil[0]
					}))
					let order = await Promise.all(sorting.sortDesc.map(val => {
						const hasil = []	
						if(val){
							hasil.push(`desc`)
						}else{
							hasil.push(`asc`)
						}
						return hasil[0]
					}))
					return OK(res, { dataTransaksi: _.orderBy(dataTransaksi, fieldName, order), dataJumlah: jml });
				}

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

				let sorting = JSON.parse(sort)
				if(sorting.sortBy.length){
					let fieldName = await Promise.all(sorting.sortBy.map(val => {
						const hasil = []
						if(val == 'date' || val == 'records'){
							hasil.push(`transaksi.${val}`)
						}else if(val == 'dp' || val == 'bv'){
							hasil.push(`total.${val}`)
						}
						return hasil[0]
					}))
					let order = await Promise.all(sorting.sortDesc.map(val => {
						const hasil = []	
						if(val){
							hasil.push(`desc`)
						}else{
							hasil.push(`asc`)
						}
						return hasil[0]
					}))
					return OK(res, { dataTransaksi: _.orderBy(dataTransaksi, fieldName, order), dataJumlah: jml });
				}

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

function getDashboardTransaksiDaily (models) {
  return async (req, res, next) => {
		let { tahun, bulan } = req.query
    try {
			const data = await models.TransaksiDaily.findOne({
				where: { tahun: tahun, bulan: bulan },
				order: [
					['idTransaksiDaily', 'ASC'],
				]
			});

			return OK(res, {
				tahun: data.tahun,
				bulan: data.bulan,
				dataJson: data.dataJson ? JSON.parse([data.dataJson]) : []
			});
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

function getDashboardShipping () {
  return async (req, res, next) => {
		try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-shipping-type`,
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

function getDashboardCourier () {
  return async (req, res, next) => {
		try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-order-courier`,
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
		let { id_user, payload } = req.body
    try {
			if(!id_user.length) { return NOT_FOUND(res, 'ID User harap diisi !'); }
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/blast-notif`,
				method: 'PUT',
				data: {
					id_user,
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

function getDetailUserActive (models) {
  return async (req, res, next) => {
		let { page = 1, limit = 20, isMember, detail, bulan } = req.query
    try {
			const mappingbulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
			let bulanNum = _.indexOf(mappingbulan, bulan) + 1
			bulanNum = bulanNum >= 10 ? bulanNum : "0"+bulanNum
			let tahun = new Date().getFullYear()
			let jumlah_hari = new Date(tahun, bulanNum, 0).getDate()
			const getBody = {
				dateFrom: dayjs(tahun+"-"+bulanNum+"-01").utc().format(),
					dateTo: dayjs(tahun+"-"+bulanNum+"-"+jumlah_hari).utc().format()
			}

			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-user-active?page=${page}&limit=${limit}&dateRange=${getBody.dateFrom},${getBody.dateTo}&isMember=${isMember}&detail=${detail}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			const { records, pageSummary } = response.data

			return OK(res, { records, pageSummary });
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function getDetailOrderUserActive (models) {
  return async (req, res, next) => {
		let { isMember, idUser, bulan } = req.query
    try {
			const mappingbulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
			let bulanNum = _.indexOf(mappingbulan, bulan) + 1
			bulanNum = bulanNum >= 10 ? bulanNum : "0"+bulanNum
			let tahun = new Date().getFullYear()
			let jumlah_hari = new Date(tahun, bulanNum, 0).getDate()
			const getBody = {
				dateFrom: dayjs(tahun+"-"+bulanNum+"-01").utc().format(),
					dateTo: dayjs(tahun+"-"+bulanNum+"-"+jumlah_hari).utc().format()
			}

			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-detail-order-user-active?dateRange=${getBody.dateFrom},${getBody.dateTo}&isMember=${isMember}&idUser=${idUser}`,
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

function getSurveyDNM () {
  return async (req, res, next) => {
		let { page, limit = 10, sort, dateRange, rating, keyword } = req.query
    try {
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/users/backofficers/user-quesioner?page=${page}&limit=${limit}${dateRange ? `&dateRange=${dateRange}` : ''}${keyword ? `&keyword=${keyword}` : ''}${rating ? `&rating=${rating}` : ''}&sort=${sort ? sort : 'createdAt-DESC'}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})

			const { records, pageSummary } = response.data

			return OK(res, { records, pageSummary });
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

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

function reloadDashboardTransaksiDaily (models) {
  return async (req, res, next) => {
		let { tahun, bulan } = req.query
    try {
			const mappingbulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
			// let tahun = new Date().getFullYear()
			// let bulan = mappingbulan[new Date().getMonth()]
			let bulanNum = _.indexOf(mappingbulan, bulan) + 1
			let jumlah_hari = new Date(tahun, bulanNum, 0).getDate()
			let bln = bulanNum >= 10 ? bulanNum : "0"+bulanNum

			const data = await models.TransaksiDaily.findAll({
				where: { tahun: tahun, bulan: bulan },
				order: [
					['idTransaksiDaily', 'ASC'],
				]
			});
			if(!data.length) {
				const payload = { tahun: tahun, bulan: bulan, dataJson: null }
				await models.TransaksiDaily.create(payload)
			}

			const login = await loginKnet()
			const dataJson = []
			const getBody = {
				dateFrom: tahun+"-"+bln+"-01",
				dateTo: tahun+"-"+bln+"-"+jumlah_hari
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
					dataJson.push({
						tanggal: new Date(val.transaksi.date).getDate(),
						record: val.transaksi.records,
						dp: val.total.dp,
						bv: val.total.bv,
					})
				});
			}

			await models.TransaksiDaily.update({ tahun, bulan, dataJson: JSON.stringify(dataJson)}, { where: { tahun, bulan } })
			return OK(res);
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
					dateFrom: dayjs(tahun+"-"+bulan+"-01").utc().format(),
					dateTo: dayjs(tahun+"-"+bulan+"-"+jumlah_hari).utc().format()
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
			for (let index = 1; index <= Number(totalPages); index++) {
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
	
				let worksheet = workbook.addWorksheet(`${Number(totalPages) > 1 ? `Data Order - Page ${index}` : 'Data Order'}`);
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

function exportExcelTransaksiFix () {
  return async (req, res, next) => {
		let { limit, totalPages, sort = '' } = req.query
		let { data_transaksi } = req.body
    try {
			let workbook = new excel.Workbook();
			let totalseluruhnya = []
			for (let index = 1; index <= Number(totalPages)+1; index++) {
				if(index > Number(totalPages)){
					let worksheet = workbook.addWorksheet("Total Transaksi");
					worksheet.columns = [
						{ header: "Halaman", key: "page", width: 20 },
						{ header: "DP", key: "dp", width: 20 },
						{ header: "BV", key: "bv", width: 20 },
					];
					const figureColumns = [1, 2, 3];
					figureColumns.forEach((i) => {
						worksheet.getColumn(i).alignment = { horizontal: "left" };
					});
					worksheet.addRows(totalseluruhnya);
					worksheet.state = 'visible';
				} else {
					let arrayData = []
					let sorting = JSON.parse(sort)
					if(sorting.sortBy.length){
						let fieldName = sorting.sortBy.filter(str => str === 'orderNumber')
						let indexField = sorting.sortBy.indexOf('orderNumber')
						let order = await Promise.all(sorting.sortDesc.map(val => {
							const hasil = []	
							if(val){
								hasil.push(`desc`)
							}else{
								hasil.push(`asc`)
							}
							return hasil[0]
						}))
						arrayData = _.orderBy(data_transaksi, fieldName, order[indexField])
						arrayData = arrayData.slice((index - 1) * Number(limit), index * Number(limit))
					}else{
						arrayData = data_transaksi.slice((index - 1) * Number(limit), index * Number(limit))
					}

					let id_user = await Promise.all(arrayData.map(val => { return val.id_user }))

					const { data: response } = await request({
						url: `${KMART_BASE_URL}users/consumers?uids=${id_user.join(',')}`,
						method: 'GET',
						headers: {
							// 'Authorization': `Bearer ${TOKEN}`,
							'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
						},
					})

					let record = response.data
					let result = await Promise.all(record.map(async val => {
						const { userBase, userDetail } = val;

						const dataTransaksi = await arrayData.filter(str => str.id_user === userDetail.idUser).map(val2 => {
							return {
								...val2,
								fullname: userDetail.fullname,
								consumerType: userDetail.consumerType,
								email: userBase.email,
								devicenumber: userBase.devicenumber,
							}
						})
						return dataTransaksi
					}))

					let kumpuldata = []
					const records = result.flat()
					records.map(val => {
						let emit = {
							orderNumber: val.orderNumber,
							date: dateconvert(val.date),
							fullname: val.fullname,
							devicenumber: val.devicenumber,
							email: val.email,
							dp: val.dp,
							bv: val.bv,
						}
						kumpuldata.push(emit)
					})
		
					if(sorting.sortBy.length){
						let fieldName = sorting.sortBy.filter(str => str !== 'orderNumber')
						let index = sorting.sortBy.indexOf('orderNumber')
						if(index>=0){
							sorting.sortDesc.splice(index,1)
						}
						let order = await Promise.all(sorting.sortDesc.map(val => {
							const hasil = []	
							if(val){
								hasil.push(`desc`)
							}else{
								hasil.push(`asc`)
							}
							return hasil
						}))

						kumpuldata = _.orderBy(kumpuldata, fieldName, order)
					}

					let jml = {
						dp: 0,
						bv: 0,
					}
					await Promise.all(kumpuldata.map(async str => {
						jml.dp += str.dp
						jml.bv += str.bv
					}))
					totalseluruhnya.push({
						page: index,
						dp: jml.dp,
						bv: jml.bv,
					})

					let worksheet = workbook.addWorksheet(`${Number(totalPages) > 1 ? `Data Transaksi - Page ${index}` : 'Data Transaksi'}`);
					worksheet.columns = [
						{ header: "Invoice", key: "orderNumber", width: 20 },
						{ header: "Tanggal Order", key: "date", width: 20 },
						{ header: "Nama", key: "fullname", width: 50 },
						{ header: "No. Telepon", key: "devicenumber", width: 20 },
						{ header: "Email", key: "email", width: 25 },
						{ header: "DP", key: "dp", width: 25 },
						{ header: "BV", key: "bv", width: 25 },
					];
					const figureColumns = [1, 2, 3, 4, 5, 6, 7];
					figureColumns.forEach((i) => {
						worksheet.getColumn(i).alignment = { horizontal: "left" };
					});
					worksheet.addRows(kumpuldata);
					worksheet.state = 'visible';
				}
				// return OK(res, kumpuldata)
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
			console.log(err);
			return NOT_FOUND(res, err.message)
    }
  }  
}

function exportExcelOrderProduct () {
  return async (req, res, next) => {
		let { limit, totalPages } = req.query
		let { data_product } = req.body
    try {
			let workbook = new excel.Workbook();
			for (let index = 1; index <= Number(totalPages); index++) {
				let arrayData = data_product.slice((index - 1) * Number(limit), index * Number(limit))
				let result = _.orderBy(arrayData, ['quantity','productName'], ['desc','asc'])

				// return OK(res, result)
				let worksheet = workbook.addWorksheet(`${Number(totalPages) > 1 ? `Data Order Product - Page ${index}` : 'Data Order Product'}`);
				worksheet.columns = [
					{ header: "ID Product Sync", key: "idProductSync", width: 20 },
					{ header: "Product Name", key: "productName", width: 70 },
					{ header: "Quantity", key: "quantity", width: 15 },
				];
				const figureColumns = [1, 2, 3, 4, 5, 6, 7];
				figureColumns.forEach((i) => {
					worksheet.getColumn(i).alignment = { horizontal: "left" };
				});
				worksheet.addRows(result);
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

function exportExcelSurveyDNM () {
  return async (req, res, next) => {
		let { dateRange, rating, sort, limit, totalPages } = req.query
    try {
			let workbook = new excel.Workbook();
			for (let index = 1; index <= Number(totalPages); index++) {
				const { data: response } = await request({
					url: `${KMART_BASE_URL}admin/users/backofficers/user-quesioner?page=${index}&limit=${limit}${dateRange ? `&dateRange=${dateRange}` : ''}${rating ? `&rating=${rating}` : ''}&sort=${sort ? sort : 'createdAt-DESC'}`,
					method: 'GET',
					headers: {
						// 'Authorization': `Bearer ${TOKEN}`,
						'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
					},
				})
	
				let kumpuldata = []
				const { records } = response.data
				records.map(val => {
					let sukai = val.dataQuesioner[1].jawaban
					let emit = {
						createdAt: convertDateTime2(val.createdAt),
						idMember: val.idMember,
						fullname: val.fullname,
						email: val.email,
						devicenumber: val.deviceNumber,
						consumerType: val.consumerType,
						rating: val.dataQuesioner[0].jawaban,
						disukai: typeof sukai === 'object' ? _.join(sukai, '\n') : sukai,
						rekomendasi: val.dataQuesioner[2].jawaban,
						feedback: val.dataQuesioner[3].jawaban,
					}
					kumpuldata.push(emit)
				})
	
				let worksheet = workbook.addWorksheet(`${Number(totalPages) > 1 ? `Data Survey - Page ${index}` : 'Data Survey'}`);
				worksheet.columns = [
					{ header: "Tanggal Survey", key: "createdAt", width: 20 },
					{ header: "ID Member", key: "idMember", width: 20 },
					{ header: "Nama", key: "fullname", width: 20 },
					{ header: "Email", key: "email", width: 20 },
					{ header: "No.Telpon", key: "devicenumber", width: 20 },
					{ header: "Type Consumer", key: "consumerType", width: 20 },
					{ header: "Rating (1-5)", key: "rating", width: 20 },
					{ header: "Yang disukai dari DNM Mobile", key: "disukai", width: 60 },
					{ header: "Merekomendasikan", key: "rekomendasi", width: 20 },
					{ header: "Saran dan Masukan", key: "feedback", width: 60 },
				];
				const figureColumns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
				figureColumns.forEach((i) => {
					worksheet.getColumn(i).alignment = { vertical: 'top', horizontal: "left", wrapText: true };
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

function exportExcelOrderProductSummary () {
  return async (req, res, next) => {
		let { startdate, enddate, payment, shippingType } = req.query
		let { idProductSync } = req.body
    try {
			let workbook = new excel.Workbook();
			var url = ''
			if(startdate && enddate){ url += `dateRange=${startdate},${enddate}&` }
			if(payment){ url += `payment=${payment}&` }
			if(shippingType){ url += `shippingType=${shippingType}&`}
			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-summary-order?${url}`,
				method: 'PUT',
				data: {
					idProductSync
				},
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})
			let kumpuldata = []
			const { listData } = response.data
			listData.map(val => {
				let emit = {
					idProductSync: val.idProductSync,
					productName: val.productName,
					priceMember: val.priceMember,
					priceNonMember: val.priceNonMember,
					quantity: val.quantity,
					totalPrice: val.totalPrice,
				}
				kumpuldata.push(emit)
			})

			let worksheet = workbook.addWorksheet("Data Order Product Summary");
			worksheet.columns = [
				{ header: "ID Product Sync", key: "idProductSync", width: 20 },
				{ header: "Product Name", key: "productName", width: 40 },
				{ header: "Price Member", key: "priceMember", width: 20 },
				{ header: "Price Non Member", key: "priceNonMember", width: 20 },
				{ header: "Quantity", key: "quantity", width: 20 },
				{ header: "Total Price", key: "totalPrice", width: 20 },
			];
			const figureColumns = [1, 2, 3, 4, 5, 6];
			figureColumns.forEach((i) => {
				worksheet.getColumn(i).alignment = { vertical: 'top', horizontal: "left", wrapText: true };
			});
			worksheet.addRows(kumpuldata);
			worksheet.state = 'visible';

			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
		
			return workbook.xlsx.write(res).then(function () {
				res.status(200).end();
			});
			return OK(res, kumpuldata)
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function detailTransaksiOrder (models) {
  return async (req, res, next) => {
		let { page, limit = 10, sort = '' } = req.query
		let { data_transaksi } = req.body
    try {			
			const totalPages = Math.ceil(data_transaksi.length / Number(limit))

			let arrayData = []
			let sorting = JSON.parse(sort)
			if(sorting.sortBy.length){
				let fieldName = sorting.sortBy.filter(str => str === 'orderNumber')
				let index = sorting.sortBy.indexOf('orderNumber')
				let order = await Promise.all(sorting.sortDesc.map(val => {
					const hasil = []	
					if(val){
						hasil.push(`desc`)
					}else{
						hasil.push(`asc`)
					}
					return hasil[0]
				}))
				arrayData = _.orderBy(data_transaksi, fieldName, order[index])
			}else{
				arrayData = data_transaksi
			}

			let id_user = await Promise.all(arrayData.map(val => { return val.id_user }))

			const { data: response } = await request({
				url: `${KMART_BASE_URL}users/consumers?uids=${id_user.join(',')}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})

			let record = response.data
			let result = await Promise.all(record.map(async val => {
				const { userBase, userDetail } = val;

				const dataTransaksi = await arrayData.filter(str => str.id_user === userDetail.idUser).map(val2 => {
					return {
						...val2,
						fullname: userDetail.fullname,
						consumerType: userDetail.consumerType,
						email: userBase.email,
						devicenumber: userBase.devicenumber,
					}
				})
				return dataTransaksi
			}))

			if(sorting.sortBy.length){
				let fieldName = sorting.sortBy.filter(str => str !== 'orderNumber')
				let index = sorting.sortBy.indexOf('orderNumber')
				if(index>=0){
					sorting.sortDesc.splice(index,1)
				}
				let order = await Promise.all(sorting.sortDesc.map(val => {
					const hasil = []	
					if(val){
						hasil.push(`desc`)
					}else{
						hasil.push(`asc`)
					}
					return hasil
				}))
				return OK(res, {
					records: _.orderBy(result.flat(), fieldName, order),
					pageSummary: {
						page: Number(page),
						limit: Number(limit),
						total: result.flat().length,
						totalPages,
					}
				});
			}

			return OK(res, {
				records: result.flat(),
				pageSummary: {
					page: Number(page),
					limit: Number(limit),
					total: result.flat().length,
					totalPages,
				}
			});
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}

function detailOrderProduct (models) {
  return async (req, res, next) => {
		let { page, limit = 10, sort = '' } = req.query
		let { data_transaksi } = req.body
    try {
			// let ordernumber = await Promise.all(data_transaksi.map(val => { return val.orderNumber }))

			const { data: response } = await request({
				url: `${KMART_BASE_URL}admin/orders/get-order-product?orderID=${data_transaksi.join(',')}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})

			let record = response.data
			if(sort){
				let sorting = JSON.parse(sort)
				let fieldName = sorting.sortBy
				let order = await Promise.all(sorting.sortDesc.map(val => {
					const hasil = []	
					if(val){
						hasil.push(`desc`)
					}else{
						hasil.push(`asc`)
					}
					return hasil[0]
				}))
				let arrayData = _.orderBy(record, fieldName, order)
				const totalPages = Math.ceil(arrayData.length / Number(limit))
				let result = arrayData.slice((page - 1) * Number(limit), page * Number(limit))
				return OK(res, {
					records: result,
					pageSummary: {
						page: Number(page),
						limit: Number(limit),
						total: arrayData.length,
						totalPages,
					}
				});
			}
			
			let arrayData = _.orderBy(record, ['quantity','productName'], ['desc','asc'])
			const totalPages = Math.ceil(arrayData.length / Number(limit))
			let result = arrayData.slice((page - 1) * Number(limit), page * Number(limit))
			return OK(res, {
				records: result,
				pageSummary: {
					page: Number(page),
					limit: Number(limit),
					total: arrayData.length,
					totalPages,
				}
			});
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

// ----------------------- PLBBO ----------------------- //
function getBiodata () {
  return async (req, res, next) => {
		let { startdate, enddate, keyword, page, limit = 20 } = req.query
    try {
			let url = ''
			if(startdate && enddate){ url += `&dateRange=${startdate},${enddate}` }
			if(keyword){ url += `&keyword=${keyword}` }
			const { data: response } = await request({
				url: `${PLBBO_BASE_URL}api/get-biodata?page=${page}&limit=${limit}${url}`,
				method: 'GET',
				headers: {
					// 'Authorization': `Bearer ${TOKEN}`,
					// 'X-INTER-SERVICE-CALL': `${XINTERSERVICECALL}`,
				},
			})

			return OK(res, response.data);
    } catch (err) {
			return NOT_FOUND(res, err.message)
    }
  }  
}
// ----------------------- PLBBO ----------------------- //
module.exports = {
  hitManualKMart,
  getdataHarian,
  getdataOrder,
  getProductOrderSummary,
  getProductVariant,
  getdataNonCod,
  hitUpdateStatus,
  hitCartEmpty,
  getdataKmart,
  getDashboardTransaksi,
  getDashboardTransaksiDaily,
  getDashboardUserActive,
  getDashboardProduct,
  getDashboardShipping,
  getDashboardCourier,
  getdataConsumer,
  getTopicUser,
  getOrderUser,
  getTransaksiDetail,
  blastNotifikasi,
  setupConsumer,
  getUserNotifikasi,
  getDetailUserActive,
  getDetailOrderUserActive,
  getSurveyDNM,
  reloadDashboardTransaksi,
  reloadDashboardTransaksiDaily,
  reloadDashboardUserActive,
  exportExcel,
  exportExcelConsumer,
  exportExcelTransaksiFix,
  exportExcelOrderProduct,
  exportExcelSurveyDNM,
  exportExcelOrderProductSummary,
  detailTransaksiOrder,
  detailOrderProduct,
  testing,
	// ----- PLBBO ----- //
	getBiodata,
	// ----- PLBBO ----- //
}