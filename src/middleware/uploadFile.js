const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        const { body } = req;
        const { jenis, bagian, nama, nama_file, nama_folder } = body
        if(bagian == 'berkas' || bagian == 'event' || bagian == 'barang_lelang' || bagian == 'foto_barang_lelang' || bagian == 'produk' || bagian == 'foto_produk' ||
            bagian == 'foto_tenant_mall' || bagian == 'promo' || bagian == 'mall' || bagian == 'bukti_pemenang') {
            const path_dir = bagian == 'berkas' ? path.join(__dirname, '../public/image/berkas/' + nama_folder) : 
                    bagian == 'event' ? path.join(__dirname, '../public/image/event/' + nama_folder) :
                    bagian == 'barang_lelang' || bagian == 'foto_barang_lelang' ? path.join(__dirname, '../public/image/kelengkapan-barang-lelang/' + nama_folder) :
                    bagian == 'produk' || bagian == 'foto_produk' ? path.join(__dirname, '../public/image/produk/' + nama_folder) :
                    bagian == 'promo' ? path.join(__dirname, '../public/image/promo/' + nama_folder) :
                    bagian == 'mall' || bagian == 'foto_tenant_mall' ? path.join(__dirname, '../public/image/mall/' + nama_folder) :
                    bagian == 'bukti_pemenang' ? path.join(__dirname, '../public/image/' + nama_folder) : '' ;
            // console.log(path_dir);
            // process.exit()
            if (!fs.existsSync(path_dir)) {
                fs.mkdirSync(path_dir, 0777);
            }else{
                fs.readdirSync(path_dir, { withFileTypes: true });
            };
            callBack(null, path_dir)
        }else{
            const location = (jenis === 'images') ? './src/public/images/' : (jenis === 'excel') ? './src/public/excel/' : './src/public/pdf/'
            callBack(null, location)     // './public/images/' directory name where save the file
        }
    },
    filename: (req, file, callBack) => {
        const { body } = req;
        const { jenis, bagian, nama, nama_file, nama_folder } = body
        if(bagian == 'berkas' || bagian == 'event' || bagian == 'barang_lelang' || bagian == 'produk' || bagian == 'promo' || bagian == 'mall' || bagian == 'bukti_pemenang') {
            let extension = file.mimetype.split('/')
            callBack(null, nama_file + '.' + extension[1])
        }else{
            callBack(null, nama_file + path.extname(file.originalname))
        }
    }
})

const uploadFile = multer({
    storage: storage
}).any();

module.exports = {
    uploadFile
}