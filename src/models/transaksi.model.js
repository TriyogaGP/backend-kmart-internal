'use strict';

const TransaksiScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idTransaksi: {
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
    dp: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'dp',
    },
    bv: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'bv',
    },
  };
};

module.exports = {
  TransaksiScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const Transaksi = sequelizeInstance
      .define(
        'Transaksi',
        TransaksiScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_transaksi',
          modelName: 'Transaksi',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return Transaksi;
  },
};
