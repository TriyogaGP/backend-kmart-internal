'use strict';

const SetupScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idSetup: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_setup'
    },
    kategori: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'kategori',
    },
    dataJson: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'data_json',
    },
  };
};

module.exports = {
  SetupScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const Setup = sequelizeInstance
      .define(
        'Setup',
        SetupScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_setup',
          modelName: 'Setup',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return Setup;
  },
};
