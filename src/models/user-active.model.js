'use strict';

const UserActiveScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idUserActive: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    userType: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'user_type',
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
    dataUser: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'data',
    },
  };
};

module.exports = {
  UserActiveScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const UserActive = sequelizeInstance
      .define(
        'UserActive',
        UserActiveScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_user_active',
          modelName: 'UserActive',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return UserActive;
  },
};
