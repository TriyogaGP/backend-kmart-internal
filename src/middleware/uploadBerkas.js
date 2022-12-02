const multer = require('multer')
const path = require('path')
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        const { body } = req;
        const { jenis, bagian, nama, nama_file, nama_folder } = body
        if(bagian == 'barang_lelang') {
            const path_dir = bagian == 'barang_lelang' ? path.join(__dirname, '../public/pdf/kelengkapan-barang-lelang/' + nama_folder) : '';
            if (!fs.existsSync(path_dir)) {
                fs.mkdirSync(path_dir, 0777);
            }else{
                fs.readdirSync(path_dir, { withFileTypes: true });
            }
            callBack(null, path_dir)
        }else{
            const location = (jenis === 'excel') ? './src/public/excel/' : './src/public/pdf/'
            callBack(null, location)     // './public/images/' directory name where save the file
        }
        // console.log(path_dir);
        // process.exit()
    },
    filename: (req, file, callBack) => {
        const { body } = req;
        const { jenis, bagian, nama, nama_file, nama_folder } = body
        callBack(null, nama_file + path.extname(file.originalname))
    }
})

const uploadBerkas = multer({
    storage: storage
}).any();

module.exports = {
    uploadBerkas
}