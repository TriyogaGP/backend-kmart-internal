const express = require("express");
const cors = require("cors");
const auth = require('./routes/auth');
const settings = require('./routes/settings');
const admin = require('./routes/admin');
const kmart = require('./routes/kmart');
const { sequelizeInstance, Sequelize } = require('./configs/db.config');
const { importModels } = require('./models/index')
const models = importModels(sequelizeInstance, Sequelize);
const { verifyToken } = require('./middleware/VerifyToken');
const app = express();
const path = require('path');
const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const dotenv = require('dotenv');
dotenv.config();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const swagger = require('./swagger')

dayjs.extend(utc);
dayjs.extend(timezone);

try {
  sequelizeInstance.authenticate();
  console.log('Connection has been established successfully.');
  
  // const corsOptions = { origin: "http://localhost:3000" };
  // app.use(cors(corsOptions));
  app.use(cors({credentials:true, origin:'*'}));
  app.options("*", cors());
  // parse requests of content-type - application/json
  app.use(express.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname,'/public')));
  // simple route
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." });
  });
  //api
  app.use('/api/v1/auth', auth(models));
  app.use('/api/v1/settings', verifyToken, settings(models));
  app.use('/api/v1/admin', verifyToken, admin(models));
  app.use('/api/v1/kmart', kmart(models));
  
  app.use(swagger());
  
  //Socket IO
  const {
    userJoin,
    getCurrentUser,
    getUsersData,
    getMassageRoom,
    userJoinBidding,
    getCurrentUserBidding,
    getUpdateLot,
    getUserBidding,
    setUserBidding,
    setUserPemenang,
    getUserPemenang,
    setNotifikasi,
    messageRoom,
    getUserData,
    userLeave,
    getDataLot,

    userJoinTesting,
    clearUsers,
  } = require("./utils/socketIO-utils");

  io.on("connection", (socket) => {
    console.log(`Socket.IO connected ${socket.id}`);
    socket.on("join-testing", async ({ room, nama }) => {
      const user = await userJoinTesting(socket.id, room, nama);
      socket.join(user.room);
      io.to(user.room).emit("UsersData", user);
    });

    socket.on("clear", async ({ room }) => {
      const user = await clearUsers(room);
      io.emit("clear", user);
    });

    socket.on("join", async ({ room, id_peserta, id_event, is_admin, device }) => {
      const joinUser = await userJoin(socket.id, room, id_peserta, id_event, is_admin, device);
      const getUser = await getCurrentUser(joinUser);
      socket.join(getUser.room);
      // console.log(getUser)
      io.to(getUser.room).emit('message', { pesan: `${getUser.isAdmin == 1 && 'Admin'} ${getUser.nama} masuk room dengan no ID ${getUser.idUser}`, id: getUser.idUser, data: getUser });
      const getUserAll = await getUsersData(socket.id);
      io.to(getUser.room).emit("UserAll", getUserAll);
      const getMessage = await getMassageRoom(getUser.room);
      io.to(getUser.room).emit("MessageRoomAll", getMessage);
    });

    socket.on("join-bidding", async ({ room, id_peserta, id_event, id_npl, id_lot, is_admin, device }) => {
      const joinUser = await userJoinBidding(socket.id, room, id_peserta, id_event, id_npl, id_lot, is_admin, device);
      const getUser = await getCurrentUserBidding(joinUser);
      socket.join(getUser.room);
      if(is_admin){
        io.to(getUser.room).emit('join-message', `Admin buat room dengan nama ${room}`);
      }else{
        await setNotifikasi('create', id_peserta, room);
        io.to(getUser.room).emit('join-message', `${getUser.nama} masuk room dengan no ID ${getUser.idUser}`);
        // const getLot = await getDataLot(id_lot);
        // io.to(getUser.room).emit('hitung-mundur', getLot);
      }
      const getUserBid = await getUserBidding(getUser.idLot);
      io.to(getUser.room).emit("bid", { dataBid: getUserBid });
    });
  
    socket.on("hitung-mundur", async ({ room, id_lot }) => {
      await getUpdateLot(id_lot);
      const getLot = await getDataLot(id_lot);
      io.emit('hitung-mundur', getLot);
    })

    socket.on("bid", async ({ room, id_npl, id_lot, harga_bidding, is_admin }) => {
      const bidding = await setUserBidding(id_npl, id_lot, harga_bidding, is_admin);
      // io.to(room).emit("trigBid", bidding);
      const getUserBid = await getUserBidding(bidding.idLot);
      io.to(room).emit("bid", { dataBid: getUserBid });
    });
    
    socket.on("send-pemenang", async ({ create_by, room, id_bidding, nominal, nama, no_npl, remarks }) => {
      const check = await getUserPemenang(id_bidding)
      if(!check) {
        const pemenang = await setUserPemenang(create_by, id_bidding, nominal, nama, no_npl, remarks)
        io.emit("send-pemenang", pemenang);
        await setNotifikasi('update', null, room, id_bidding, `Pemenang Lelang ${room}`, remarks, 1);
        io.emit("notifikasi", true);
      }
    });
  
    socket.on("notifikasi", (message) => {
      io.emit("notifikasi", message);
    });

    socket.on("done-bidding", (message) => {
      io.emit("done-bidding", message);
    });
    
    socket.on("tombolJoin", (trig) => {
      io.emit('tombolJoin', trig);
    });

    socket.on("LanjutRoomBid", (noLot) => {
      // console.log(noLot);
      io.emit('LanjutRoomBid', noLot);
    });
  
    socket.on("kirimMessage", async ({ room, id_peserta, id_event, is_admin, pesan }) => {
      const message = await messageRoom(room, id_peserta, id_event, is_admin, pesan);
      io.emit("kirimMessage", message);
      const getMessage = await getMassageRoom(room);
      io.to(room).emit("MessageRoomAll", getMessage);
    });
    
    socket.on("typing", function (data) {
      socket.broadcast.emit("typing", data);
    });
  
    socket.on("disconnect", async () => {
      const getUser = await getUserData(socket.id);
      console.log('disconnect '+ socket.id)
      // console.log(user);
      if (getUser.status) {
        const getUserAll = await getUsersData(socket.id);
        io.to(getUser.room).emit("UserAll", getUserAll);
        await userLeave(socket.id);
        io.to(getUser.room).emit('message', { pesan: `${getUser.nama} keluar dari room ${getUser.room}`, id: '', data: '' });
        // socket.broadcast.to(getUser.room).emit("deviceStatus", false);
      }
    });
  });

  //cron job
    // let now = dayjs();
    // async function Cron() {
    //   try {
    //     const dataEvent = await models.Event.findAll({
    //       where: { statusAktif: true },
    //       attributes: { exclude: ['createBy', 'updateBy', 'deleteBy', 'createdAt', 'updatedAt', 'deletedAt'] },
    //     });
    //     const kumpulDateTime = []
    //     dataEvent.map(val => {
    //       let eventTime = dayjs([val.tanggalEvent, val.waktuEvent].join(" ")).add(1, 'day').toDate();
    //       if(eventTime < now) {
    //         kumpulDateTime.push(eventTime)
    //       }
    //     })
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    // let event = cron.schedule('* * * * *', async () => {
    //   Cron();
    // })
    // event.start();

  const PORT = process.env.PORT || 3534;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// set port, listen for requests

module.exports = app;