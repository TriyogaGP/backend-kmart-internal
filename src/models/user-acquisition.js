'use strict';

const UserAcquisitionScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idUserAcquisition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date',
    },
    acquisition: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'acquisition',
    },
    notes: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'notes',
    },
  };
};

module.exports = {
  UserAcquisitionScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const UserAcquisition = sequelizeInstance
      .define(
        'UserAcquisition',
        UserAcquisitionScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_useracquisition',
          modelName: 'UserAcquisition',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return UserAcquisition;
  },
};
