'use strict';

const BeritaAcaraScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idBeritaAcara: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_berita_acara'
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'order_number',
    },
		penjelasan: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'penjelasan',
		},
    requestBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'request_by',
    },
    createBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'create_by'
    },
    updateBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'update_by'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: true,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      allowNull: true,
      field: 'updated_at',
    },
  };
};

module.exports = {
  BeritaAcaraScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const BeritaAcara = sequelizeInstance
      .define(
        'BeritaAcara',
        BeritaAcaraScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_berita_acara',
          modelName: 'BeritaAcara',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );
		
    return BeritaAcara;
  },
};
