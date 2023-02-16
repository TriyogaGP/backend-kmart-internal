'use strict';

const TransaksiDailyScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idTransaksiDaily: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    tahun: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'tahun',
    },
    bulan: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'bulan',
    },
    dataJson: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'data_json',
    },
  };
};

module.exports = {
  TransaksiDailyScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const TransaksiDaily = sequelizeInstance
      .define(
        'TransaksiDaily',
        TransaksiDailyScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_transaksi_daily',
          modelName: 'TransaksiDaily',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return TransaksiDaily;
  },
};
