const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
	process.env.DB_NAME || 'studyhub',
	process.env.DB_USER || 'root',
	process.env.DB_PASSWORD || 'root123',
	{
		host: process.env.DB_HOST || '127.0.0.1',
		port: parseInt(process.env.DB_PORT, 10) || 3306,
		dialect: 'mysql',
		logging: false,
		define: {
			timestamps: true,
			underscored: true,
			createdAt: 'createdAt',
			updatedAt: 'updatedAt',
		},
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	}
);

async function connect() {
	console.log('Starting MySQL connection...');
	try {
		await sequelize.authenticate();
		console.log('Connect successfully!');
	} catch (error) {
		console.error('Connect failed:', error.message);
		throw error;
	}
}

module.exports = { sequelize, connect };
