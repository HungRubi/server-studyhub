const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/db');

const User = sequelize.define(
	'User',
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
		},
		role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' } },
		email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
		username: { type: DataTypes.STRING(100), allowNull: true, unique: true },
		password_hash: { type: DataTypes.STRING(255), allowNull: false },
		first_name: { type: DataTypes.STRING(100), allowNull: true },
		last_name: { type: DataTypes.STRING(100), allowNull: true },
		full_name: { type: DataTypes.STRING(200), allowNull: true },
		avatar_url: { type: DataTypes.TEXT, allowNull: true },
		bio: { type: DataTypes.TEXT, allowNull: true },
		phone: { type: DataTypes.STRING(20), allowNull: true },
		country: { type: DataTypes.STRING(100), allowNull: true },
		city: { type: DataTypes.STRING(100), allowNull: true },
		address: { type: DataTypes.TEXT, allowNull: true },
		email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		phone_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		two_factor_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		two_factor_secret: { type: DataTypes.STRING(255), allowNull: true },
		status: {
			type: DataTypes.ENUM('active', 'inactive', 'banned', 'pending'),
			allowNull: false,
			defaultValue: 'active',
		},
		last_login_at: { type: DataTypes.DATE, allowNull: true },
		last_login_ip: { type: DataTypes.STRING(50), allowNull: true },
		password_reset_token: { type: DataTypes.STRING(255), allowNull: true },
		password_reset_expires: { type: DataTypes.DATE, allowNull: true },
		login_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
		refreshToken: { type: DataTypes.STRING(500), allowNull: true, field: 'refresh_token' },
	},
	{
		tableName: 'users',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		deletedAt: 'deleted_at',
		paranoid: true,
		underscored: true,
		defaultScope: {
			attributes: { exclude: ['password_hash', 'refreshToken', 'password_reset_token', 'two_factor_secret'] },
		},
		scopes: {
			withPassword: {
				attributes: {},
			},
		},
	}
);

const Role = require('./role.model');
User.belongsTo(Role, { foreignKey: 'role_id' });

module.exports = User;
