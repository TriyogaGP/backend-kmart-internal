'use strict';

const UserInstallScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idUserInstall: {
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
    install: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'install',
    },
    notes: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'notes',
    },
  };
};

module.exports = {
  UserInstallScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const UserInstall = sequelizeInstance
      .define(
        'UserInstall',
        UserInstallScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_userinstall',
          modelName: 'UserInstall',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );

    return UserInstall;
  },
};
