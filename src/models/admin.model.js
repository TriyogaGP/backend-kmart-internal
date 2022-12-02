'use strict';

const AdminScheme = Sequelize => {
  const { DataTypes } = Sequelize;

  return {
    idAdmin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_admin'
    },
    nama: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'nama',
    },
    username: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'username',
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'email',
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'password',
    },
		kataSandi: {
			type: DataTypes.STRING(256),
			allowNull: true,
			field: 'katasandi',
		},
    noHP: {
			type: DataTypes.STRING(15),
      allowNull: true,
      field: 'no_hp',
    },
		kota: {
			type: DataTypes.STRING(256),
			allowNull: true,
			field: 'kota',
		},
		alamat: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'alamat',
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'level'
    },
    statusAktif: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'status_aktif',
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
    deleteBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'delete_by'
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
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true,
      field: 'deleted_at',
    },
  };
};

module.exports = {
  AdminScheme,
  ModelFn: (sequelizeInstance, Sequelize) => {
    const Admin = sequelizeInstance
      .define(
        'Admin',
        AdminScheme(Sequelize),
        {
          sequelizeInstance,
          tableName: 'm_admin',
          modelName: 'Admin',
          underscored: true,
          timestamps: false,
          paranoid: true,
        },
      );
		
    Admin.associate = models => {
      models.Admin.belongsTo(models.Role, {
        foreignKey: 'level',
        constraint: false
      });
    }
    return Admin;
  },
};
