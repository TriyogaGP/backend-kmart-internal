const { decrypt, convertDateTime, dateconvert, convertDate } = require('./helper.utils');

function _buildResponseMenu(dataMenu) {
	return dataMenu.map(val => {
		return {
			idMenu: val.idMenu,
			idRole: val.idRole,
			namaRole: val.Role.namaRole,
			menuText: val.menuText,
			menuRoute: val.menuRoute,
			menuIcon: val.menuIcon,
			position: val.position,
			status: val.status,
		}
	})
}

async function _buildResponseKurir(models, dataKurir) {
	const dataKurirService = await models.KurirService.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpul = []
	return dataKurir.map(val => {
		dataKumpul = dataKurirService.filter(kurser => kurser.idKurir === val.idKurir)

		return {
			idKurir: val.idKurir,
			namaKurir: val.namaKurir,
			label: val.label,
			image: val.image,
			statusAktif: val.statusAktif,
			dataKurirService: dataKumpul,
		}
	})
}

function _buildResponseLoggerAdmin(dataLoggerAdmin) {
	return dataLoggerAdmin.map(val => {
		return {
			idLoggerAdmin: val.idLoggerAdmin,
			idAdmin: val.idAdmin,
			nama: val.Admin.nama,
			latitude: val.latitude,
			longitude: val.longitude,
			provinsi: val.provinsi,
			kota: val.kota,
			createdAt: convertDateTime(val.createdAt),
		}
	})
}

function _buildResponseLoggerPeserta(dataLoggerPeserta) {
	return dataLoggerPeserta.map(val => {
		return {
			idLoggerPeserta: val.idLoggerPeserta,
			idPeserta: val.idPeserta,
			nama: val.User.nama,
			latitude: val.latitude,
			longitude: val.longitude,
			provinsi: val.provinsi,
			kota: val.kota,
			createdAt: convertDateTime(val.createdAt),
		}
	})
}

function _buildResponseAdmin(dataAdmin, refreshToken, accessToken) {
	return {
		idAdmin: dataAdmin.idAdmin,
		downlineTenant: dataAdmin.downlineTenant,
		nama: dataAdmin.nama,
		username: dataAdmin.username,
		email: dataAdmin.email,
		password: dataAdmin.password,
		kataSandi: dataAdmin.kataSandi,
		noHP: dataAdmin.noHP,
		kota: dataAdmin.kota,
		alamat: dataAdmin.alamat,
		level: dataAdmin.level,
		namaRole: dataAdmin.Role.namaRole,
		statusAktif: dataAdmin.statusAktif,
		refreshToken,
		accessToken
	}
}

function _buildResponsePeserta(dataPeserta, refreshToken, accessToken) {
	return {
		...dataPeserta.dataValues,
		refreshToken,
		accessToken
	}
}

async function _buildResponseBarangLelang(models, dataBarangLelang) {
	const dataFotoBarangLelang = await models.FotoBarangLelang.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpul = []
	return dataBarangLelang.map(val => {
		dataKumpul = dataFotoBarangLelang
		.filter(barleng => barleng.idBarangLelang === val.idBarangLelang)
		.map(val2 => {
			// let objectBaru = Object.assign(val2, {
			// 	gambar: val2.gambar
			// });
			// return objectBaru
			return val2
		})

		return {
			idBarangLelang: val.idBarangLelang,
			idKategori: val.idKategori,
			namaKategori: val.KategoriLelang.kategori,
			statusKategoriLelang: val.KategoriLelang.statusAktif,
			namaBarangLelang: val.namaBarangLelang,
			namaPemilik: val.namaPemilik,
			brand: val.brand,
			warna: val.warna,
			tahun: val.tahun,
			lokasiBarang: val.lokasiBarang,
			noRangka: val.noRangka,
			noMesin: val.noMesin,
			tipeModel: val.tipeModel,
			transmisi: val.transmisi,
			bahanBakar: val.bahanBakar,
			odometer: val.odometer,
			grade: val.grade,
			gradeInterior: val.gradeInterior,
			gradeEksterior: val.gradeEksterior,
			gradeMesin: val.gradeMesin,
			noPolisi: val.noPolisi,
			validSTNK: val.validSTNK ? convertDate(val.validSTNK) : null,
			sph: val.sph,
			kir: val.kir,
			kapasitasKendaraan: val.kapasitasKendaraan,
			deskripsi: val.deskripsi,
			UnixText: val.UnixText,
			stnk: val.stnk,
			bpkb: val.bpkb,
			faktur: val.faktur,
			ktpPemilik: val.ktpPemilik,
			kwitansi: val.kwitansi,
			statusAktif: val.statusAktif,
			dataFotoBarangLelang: {
				FotoMobil: dataKumpul.filter(val => val.kategori == 'Utama'), 
				FotoKondisiMobil: dataKumpul.filter(val => val.kategori == 'Kondisi')
			},
		}
	})
}

async function _buildResponseProduk(models, dataProduk) {
	const dataFotoProduk = await models.FotoProduk.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	const dataUpdateStok = await models.UpdateStok.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	const dataFeedbackUser = await models.FeedbackUser.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
		include: [
			{
				model: models.User,
				attributes: ['nama', 'email', 'noHP'],
			}
		] 
	});

	let dataKumpul = [], kumpulFeed = []
	let sisaStok = 0
	let rateProduk = 0
	return dataProduk.map(val => {
		let stokMasuk = 0, stokKeluar = 0, rating = 0, jumlahProduk = 0

		dataKumpul = dataFotoProduk
		.filter(barleng => barleng.idProduk === val.idProduk)
		.map(val2 => {
			return val2
		})

		dataUpdateStok
		.filter(stok => stok.idProduk === val.idProduk)
		.map((val2) => {
			if(val2.statusAktif == 1){
				stokMasuk += val2.tambahStok
				stokKeluar += val2.kurangStok
			}
		})

		kumpulFeed = dataFeedbackUser
		.filter(feedback => feedback.idProduk === val.idProduk)
		.map(val2 => {
			rating += val2.rating
			jumlahProduk += 1
			let objectBaru = {
				idFeedbackPeserta: val2.idFeedbackPeserta,
				idOrder: val2.idOrder,
				idPeserta: val2.idPeserta,
				rating: val2.rating,
				comment: val2.comment,
				gambar: val2.gambar ? JSON.parse([val2.gambar]) : [],
				nama: val2.User.nama,
				email: val2.User.email,
				noHP: val2.User.noHP
			};
			return objectBaru
		})

		sisaStok = parseInt(stokMasuk) - parseInt(stokKeluar)
		rateProduk = parseInt(rating) / parseInt(jumlahProduk)

		return {
			idProduk: val.idProduk,
			idKategoriProduk: val.idKategoriProduk,
			kategoriProduk: val.KategoriProduk.kategoriProduk,
			statuskategoriProduk: val.KategoriProduk.statusAktif,
			idMeasurement: val.idMeasurement,
			name: val.Measurement.name,
			displayName: val.Measurement.displayName,
			kodeProduk: val.kodeProduk,
			merekProduk: val.merekProduk,
			namaProduk: val.namaProduk,
			harga: val.harga,
			stok: val.stok,
			berat: val.berat,
			point: val.point,
			deskripsi: val.deskripsi,
			UnixText: val.UnixText,
			coverImage: val.coverImage,
			statusAktif: val.statusAktif,
			sisaStok: sisaStok ? sisaStok : 0,
			rateProduk: rateProduk ? rateProduk : 0,
			dataFotoProduk: dataKumpul,
			dataFeedbackUser: kumpulFeed,
		}
	})
}

async function _buildResponseLot(models, dataLot) {
	const dataFotoBarangLelang = await models.FotoBarangLelang.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpulFoto = []
	return dataLot.map(val => {
		dataKumpulFoto = dataFotoBarangLelang
		.filter(barleng => barleng.idBarangLelang === val.idBarangLelang)
		.map(val2 => {
			return val2
		})

		let dataBarLel = {
			...val.BarangLelang.dataValues, 
			KategoriLelang: {
				namaKategori: val.BarangLelang.dataValues.KategoriLelang.kategori, 
				statusKategoriLelang: val.BarangLelang.dataValues.KategoriLelang.statusAktif 
			}
		};

		let dataEvent = {
			...val.Event.dataValues, 
			startEvent: dateconvert(val.Event.dataValues.tanggalEvent)+' '+val.Event.dataValues.waktuEvent
		};

		return {
			idLot: val.idLot,
			noLot: val.noLot,
			hargaAwal: val.hargaAwal,
			statusLot: val.statusLot,
			statusAktif: val.statusAktif,
			Event: dataEvent,
			BarangLelang: dataBarLel,
			dataFotoBarangLelang: { 
				FotoMobil: dataKumpulFoto.filter(val => val.kategori == 'Utama'), 
				FotoKondisiMobil: dataKumpulFoto.filter(val => val.kategori == 'Kondisi')
			},
		}
	})
}

async function _buildResponseNPL(models, kategori = null, id_event, dataPembelianNPL) {
	if(kategori == 'withNPL') {
		const dataNPL = await models.NPL.findAll({
			attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
			include: [
				{
					model: models.RefundNPL,
					attributes: { exclude: ['createBy', 'updateBy', 'createdAt', 'updatedAt'] },
				}
			]
		});
		
		let dataKumpulNPL = []
		return dataPembelianNPL.map(val => {
			dataKumpulNPL = dataNPL
			.filter(npl => npl.idPembelianNPL === val.idPembelianNPL)
			.map(val2 => {
				let objectBaru = Object.assign(val2.dataValues, {
					RefundNPL: val2.dataValues.RefundNPL != null ? val2.dataValues.RefundNPL : {}
				});
				return objectBaru
			})

			return {
				idPembelianNPL: val.idPembelianNPL,
				idPeserta: val.idPeserta,
				idEvent: val.idEvent,
				typePembelian: val.typePembelian,
				typeTransaksi: val.typeTransaksi,
				noPembelian: val.noPembelian,
				verifikasi: val.verifikasi,
				nominal: val.nominal,
				tanggalTransfer: convertDateTime(val.tanggalTransfer),
				pesanVerifikasi: val.pesanVerifikasi,
				bukti: val.bukti,
				statusAktif: val.statusAktif,
				nik: val.User.nik,
				nama: val.User.nama,
				email: val.User.email,
				noHP: val.User.noHP,
				UnixText: val.User.UnixText,
				statusPeserta: val.User.statusAktif,
				kodeEvent: val.Event.kodeEvent,
				namaEvent: val.Event.namaEvent,
				tanggalEvent: dateconvert(val.Event.tanggalEvent)+' '+val.Event.waktuEvent,
				statusEvent: val.Event.statusAktif,
				NPL: dataKumpulNPL,
			}
		})	
	}

	if(kategori == 'NPL') {
		const dataNPL = await models.NPL.findOne({
			where: { idEvent: id_event },
			attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
			order: [
				['idNpl', 'DESC'],
			]
		});

		return {
			dataNPL,
		}
	}

	return dataPembelianNPL.map(val => {
		return {
			idPembelianNPL: val.idPembelianNPL,
			idPeserta: val.idPeserta,
			idEvent: val.idEvent,
			typePembelian: val.typePembelian,
			typeTransaksi: val.typeTransaksi,
			noPembelian: val.noPembelian,
			verifikasi: val.verifikasi,
			nominal: val.nominal,
			tanggalTransfer: convertDateTime(val.tanggalTransfer),
			pesanVerifikasi: val.pesanVerifikasi,
			bukti: val.bukti,
			statusAktif: val.statusAktif,
			nik: val.User.nik,
			nama: val.User.nama,
			email: val.User.email,
			noHP: val.User.noHP,
			statusPeserta: val.User.statusAktif,
			kodeEvent: val.Event.kodeEvent,
			namaEvent: val.Event.namaEvent,
			tanggalEvent: dateconvert(val.Event.tanggalEvent)+' '+val.Event.waktuEvent,
			statusEvent: val.Event.statusAktif,
		}
	})
}

async function _buildResponsePemenang(models, dataPemenang) {
	const dataFotoBarangLelang = await models.FotoBarangLelang.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	const getUser = await models.User.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	const getAdmin = await models.Admin.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpulFoto = [], dataUser = []
	return dataPemenang.map(val => {
		dataKumpulFoto = dataFotoBarangLelang
		.filter(barleng => barleng.idBarangLelang === val.Bidding.LOT.idBarangLelang)
		.map(val2 => {
			// let objectBaru = Object.assign(val2, {
			// 	gambar: val2.gambar
			// });
			return val2
		})

		let dataBarLel = Object.assign(val.Bidding.LOT.BarangLelang, {
			stnk: "haha/"+val.Bidding.LOT.BarangLelang.stnk,
			bpkb: val.Bidding.LOT.BarangLelang.bpkb,
			faktur: val.Bidding.LOT.BarangLelang.faktur,
			ktpPemilik: val.Bidding.LOT.BarangLelang.ktpPemilik,
			kwitansi: val.Bidding.LOT.BarangLelang.kwitansi,
		});

		let dataEvent = Object.assign(val.Bidding.LOT.Event, {
			gambar: val.Bidding.LOT.Event.gambar
		});

		let dataPembelianNPL = Object.assign(val.Bidding.NPL.PembelianNPL, {
			bukti: val.Bidding.NPL.PembelianNPL.bukti
		});

		if(val.Bidding.isAdmin == true){
			dataUser = getAdmin.filter(value => value.idAdmin === val.Bidding.idNpl)[0]
		}else if(val.Bidding.isAdmin == false){
			dataUser = getUser.filter(value => value.idPeserta === val.Bidding.NPL.idPeserta)[0]
		}
		// let dataUser = Object.assign(val.Bidding.NPL.User, {
		// 	fotoPeserta: val.Bidding.NPL.User.fotoPeserta,
		// 	fotoKTP: val.Bidding.NPL.User.fotoKTP,
		// 	fotoNPWP: val.Bidding.NPL.User.fotoNPWP
		// });

		return {
			idPemenangLelang: val.idPemenangLelang,
			noRek: val.noRek,
			namaPemilik: val.namaPemilik,
			nominal: val.nominal,
			tanggalTransfer: val.tanggalTransfer,
			tipePelunasan: val.tipePelunasan,
			statusPembayaran: val.statusPembayaran,
			bukti: val.bukti,
			statusAktif: val.statusAktif,
			idNpl: val.Bidding.idNpl,
			data_bidding_terakhir: {
				idBidding: val.Bidding.idBidding,
				idNpl: val.Bidding.idNpl,
				hargaHidding: val.Bidding.hargaBidding,
				nominal: val.nominal,
				isAdmin: val.Bidding.isAdmin,
				waktuBidTerakhir: convertDateTime(val.Bidding.waktu),
			},
			details: {
				idLot: val.Bidding.LOT.idLot,
				noLot: val.Bidding.LOT.noLot,
				hargaAwal: val.Bidding.LOT.hargaAwal,
				statusLot: val.Bidding.LOT.statusLot,
				idNpl: val.Bidding.NPL.idNpl,
				noNpl: val.Bidding.NPL.noNpl,
				npl: val.Bidding.NPL.npl,
				statusNpl: val.Bidding.NPL.statusNpl,
				idBarangLelang: dataBarLel.idBarangLelang,
				namaBarangLelang: dataBarLel.namaBarangLelang,
				idEvent: dataEvent.idEvent,
				kodeEvent: dataEvent.kodeEvent,
				namaEvent: dataEvent.namaEvent,
				idUser: val.Bidding.isAdmin == 1 ? dataUser.idAdmin : dataUser.idPeserta,
				nama: dataUser.nama,
				email: dataUser.email,
				noHP: dataUser.noHP,
				alamat: dataUser.alamat,
				idPembelianNPL: dataPembelianNPL.idPembelianNPL,
				buktiPembelianNPL: dataPembelianNPL.bukti,
				nominalPembelianNPL: dataPembelianNPL.nominal,
				tanggalTransferPembelianNPL: convertDateTime(dataPembelianNPL.tanggalTransfer),
			}
		}
	})
}

async function _buildResponseOrder(models, dataOrder) {
	const dataDetailOrder = await models.OrderDetail.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'createdAt', 'updatedAt'] },
		include: [
			{
				model: models.Produk,
				attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
			},
		]
	});
	
	const dataOrderPayment = await models.OrderPayment.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'updatedAt', 'deletedAt'] },
	});

	const dataOrderMoves = await models.OrderMoves.findAll();

	let kumpulProduk = [], kumpulOrderPayment = [], kumpulOrderMoves = []
	return dataOrder.map(val => {
		let qty = 0, berat = 0, pointBelanja = 0, spec = ''
		dataDetailOrder
		.filter(order => order.idOrder === val.idOrder)
		.map(val2 => {
			qty += val2.jumlahProduk
			pointBelanja += val2.Produk.point
			let splitBerat = val2.Produk.berat.split(' ')
			spec = splitBerat[1]
			berat += parseInt(splitBerat[0])
		})
		let hasilBerat = berat * qty

		kumpulProduk = dataDetailOrder
		.filter(order => order.idOrder === val.idOrder)
		.map(val2 => {
			let objectBaru = Object.assign(val2.Produk.dataValues, {
				jumlahProduk: val2.dataValues.jumlahProduk ? val2.dataValues.jumlahProduk : 0,
				subTotal: val2.dataValues.subTotal ? val2.dataValues.subTotal : 0
			});
			return objectBaru
		})

		kumpulOrderPayment = dataOrderPayment
		.filter(order => order.idOrder === val.idOrder)
		.map(val2 => {
			let objectBaru = Object.assign(val2.dataValues, {
				createdAt: convertDateTime(val2.dataValues.createdAt)
			});
			return objectBaru
		})

		kumpulOrderMoves = dataOrderMoves
		.filter(order => order.idOrder === val.idOrder)
		.map(val2 => {
			let objectBaru = Object.assign(val2.dataValues, {
				createdAt: convertDateTime(val2.dataValues.createdAt)
			});
			return objectBaru
		})

		return {
			idOrder: val.idOrder,
			idPeserta: val.idPeserta,
			idAddress: val.idAddress,
			noOrder: val.noOrder,
			tanggalResi: convertDateTime(val.tanggalResi),
			shippingPrice: val.shippingPrice,
			adminFee: val.adminFee,
			total: val.total,
			statusLatest: val.statusLatest,
			qtyTotal: qty,
			berat: hasilBerat+' '+spec,
			items: kumpulProduk.length,
			pointBelanja,
			paymentMethod: kumpulOrderPayment[0].paymentMethod,
			paymentProvider: kumpulOrderPayment[0].paymentProvider,
			orderCreate: convertDateTime(val.createdAt),
			dataBuyer: {
				nama: val.User.nama,
				email: val.User.email,
				noHP: val.User.noHP,
				alamat: val.User.alamat,
			},
			dataRecipient: {
				namaPenerima: val.Address.namaPenerima,
				telpPenerima: val.Address.telpPenerima,
			},
			dataShipping: {
				namaKurir: val.Kurir.namaKurir,
				namaService: val.KurirService.namaService,
				noResi: val.noResi,
				alamatPenerima: val.Address.alamatPenerima,
				alamatDetail: val.Address.alamatDetail,
			},
			dataProduk: kumpulProduk,
			dataPaymentDetails: kumpulOrderPayment,
			dataOrderStatus: kumpulOrderMoves,
		}
	})
}

async function _buildResponseWishlist(models, dataWishlist) {
	const dataFotoProduk = await models.FotoProduk.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpul = []
	return dataWishlist.map(val => {
		dataKumpul = dataFotoProduk
		.filter(barleng => barleng.idProduk === val.idProduk)
		.map(val2 => {
			return val2
		})

		return {
			idWishlist: val.idWishlist,
			idPeserta: val.idPeserta,
			idProduk: val.idProduk,
			nama: val.User.nama,
			kodeProduk: val.Produk.kodeProduk,
			merekProduk: val.Produk.merekProduk,
			namaProduk: val.Produk.namaProduk,
			berat: val.Produk.berat,
			coverImage: val.Produk.coverImage,
			createdAt: convertDateTime(val.createdAt),
			dataFotoProduk: dataKumpul,
		}
	})
}

function _buildResponseMall(dataMall) {
	return dataMall.map(val => {
		return {
			idMall: val.idMall,
			idAdmin: val.idAdmin,
			namaMall: val.namaMall,
			deskripsi: val.deskripsi,
			alamat: val.alamat,
			provinsi: val.provinsi,
			kota: val.kota,
			noWhatsapp: val.noWhatsapp,
			UnixText: val.UnixText,
			logo: val.logo,
			nama: val.Admin.nama,
			email: val.Admin.email,
			noHP: val.Admin.noHP,
			role: val.level,
			namaRole: val.Admin.Role.namaRole,
			statusAktif: val.statusAktif,
		}
	})
}

function _buildResponseTenantMall(dataTenantMall) {
	return dataTenantMall.map(val => {
		return {
			idTenantMall: val.idTenantMall,
			idAdmin: val.idAdmin,
			idKategoriTenant: val.idKategoriTenant,
			idMall: val.idMall,
			namaTenantMall: val.namaTenantMall,
			deskripsi: val.deskripsi,
			alamat: val.alamat,
			kota: val.kota,
			provinsi: val.provinsi,
			noWhatsapp: val.noWhatsapp,
			UnixText: val.UnixText,
			logo: val.logo,
			kategoriTenant: val.KategoriTenant.kategoriTenant,
			nama: val.Admin.nama,
			email: val.Admin.email,
			noHP: val.Admin.noHP,
			idAdmin: val.Mall.idAdmin,
			namaMall: val.Mall.namaMall,
			logoMall: val.Mall.logo,
			statusAktif: val.statusAktif,
		}
	})
}

function _buildResponseContent(kategori, dataContent) {
	if(kategori == 'mall'){
		return dataContent.map(val => {
			return {
				idContentMall: val.idContentMall,
				idMall: val.idMall,
				idKategoriContent: val.idKategoriContent,
				judulContent: val.judulContent,
				link: val.link,
				deskripsi: val.deskripsi,
				foto: val.foto,
				kategoriContent: val.KategoriContent.kategoriContent,
				namaMall: val.Mall.namaMall,
				UnixText: val.Mall.UnixText,
				idAdmin: val.Mall.idAdmin,
				nama: val.Mall.Admin.nama,
				statusAktif: val.statusAktif,
			}
		})
	}else if(kategori == 'tenantmall'){
		return dataContent.map(val => {
			return {
				idContentTenantMall: val.idContentTenantMall,
				idTenantMall: val.idTenantMall,
				idKategoriContent: val.idKategoriContent,
				judulContent: val.judulContent,
				link: val.link,
				deskripsi: val.deskripsi,
				foto: val.foto,
				kategoriContent: val.KategoriContent.kategoriContent,
				namaTenantMall: val.TenantMall.namaTenantMall,
				UnixText: val.TenantMall.UnixText,
				idAdmin: val.TenantMall.idAdmin,
				nama: val.TenantMall.Admin.nama,
				statusAktif: val.statusAktif,
			}
		})
	}
}

async function _buildResponseRoom(models, dataLot) {
	const dataFotoBarangLelang = await models.FotoBarangLelang.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] }
	});

	let dataKumpulFoto = []
	dataKumpulFoto = dataFotoBarangLelang
	.filter(barleng => barleng.idBarangLelang === dataLot.idBarangLelang)
	.map(val2 => {
		return val2
	})

	let dataBarLel = {
		...dataLot.BarangLelang.dataValues, 
		namaKategori: dataLot.BarangLelang.dataValues.KategoriLelang.kategori, 
		statusKategoriLelang: dataLot.BarangLelang.dataValues.KategoriLelang.statusAktif 
		// KategoriLelang: {
		// }
	};

	let dataEvent = {
		...dataLot.Event.dataValues, 
		startEvent: dateconvert(dataLot.Event.dataValues.tanggalEvent)+' '+dataLot.Event.dataValues.waktuEvent
	};

	return {
		idLot: dataLot.idLot,
		noLot: dataLot.noLot,
		hargaAwal: dataLot.hargaAwal,
		statusLot: dataLot.statusLot,
		statusAktif: dataLot.statusAktif,
		Event: dataEvent,
		BarangLelang: dataBarLel,
		dataFotoBarangLelang: { 
			FotoMobil: dataKumpulFoto.filter(val => val.kategori == 'Utama'), 
			FotoKondisiMobil: dataKumpulFoto.filter(val => val.kategori == 'Kondisi')
		},
	}
}

async function _buildResponseBidLelang(models, dataPembelianNPL) {
	const dataNPL = await models.NPL.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
		include: [
			{
				model: models.RefundNPL,
				attributes: { exclude: ['createBy', 'updateBy', 'createdAt', 'updatedAt'] },
			}
		]
	});

	const dataLot = await models.LOT.findAll({
		attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
	});
	
	let dataKumpulNPL = [], dataKumpulLot = []
	return dataPembelianNPL.map(val => {
		dataKumpulNPL = dataNPL
		.filter(npl => npl.idPembelianNPL === val.idPembelianNPL)
		.map(val2 => {
			let objectBaru = Object.assign(val2.dataValues, {
				RefundNPL: val2.dataValues.RefundNPL != null ? val2.dataValues.RefundNPL : {}
			});
			return objectBaru
		})

		dataKumpulLot = dataLot
		.filter(lot => lot.idEvent === val.idEvent && lot.statusLot === 2)
		.map(val2 => {
			return val2
		})

		return {
			idPembelianNPL: val.idPembelianNPL,
			idPeserta: val.idPeserta,
			idEvent: val.idEvent,
			typePembelian: val.typePembelian,
			typeTransaksi: val.typeTransaksi,
			noPembelian: val.noPembelian,
			verifikasi: val.verifikasi,
			nominal: val.nominal,
			tanggalTransfer: convertDateTime(val.tanggalTransfer),
			pesanVerifikasi: val.pesanVerifikasi,
			bukti: val.bukti,
			statusAktif: val.statusAktif,
			nik: val.User.nik,
			nama: val.User.nama,
			email: val.User.email,
			noHP: val.User.noHP,
			UnixText: val.User.UnixText,
			statusPeserta: val.User.statusAktif,
			Event: {
				idEvent: val.Event.idEvent,
				kodeEvent: val.Event.kodeEvent,
				namaEvent: val.Event.namaEvent,
				tanggalEvent: dateconvert(val.Event.tanggalEvent)+' '+val.Event.waktuEvent,
				kodeevent_split: val.Event.kodeEvent.split('-')[2],
				kataSandiEvent: decrypt(val.Event.kataSandiEvent),
				gambar: val.Event.gambar,
				statusEvent: val.Event.statusAktif,
				LOT: dataKumpulLot,
			},
			NPL: dataKumpulNPL,
		}
	})
}

module.exports = {
  _buildResponseMenu,
  _buildResponseKurir,
  _buildResponseLoggerAdmin,
  _buildResponseLoggerPeserta,
  _buildResponseAdmin,
  _buildResponsePeserta,
  _buildResponseBarangLelang,
  _buildResponseProduk,
  _buildResponseLot,
  _buildResponseNPL,
  _buildResponsePemenang,
  _buildResponseOrder,
  _buildResponseWishlist,
  _buildResponseMall,
  _buildResponseTenantMall,
  _buildResponseContent,
  _buildResponseRoom,
  _buildResponseBidLelang,
}