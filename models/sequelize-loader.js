'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.STEPNDB_DB, process.env.STEPNDB_USER, process.env.STEPNDB_PASS, {
		host: process.env.STEPNDB_HOST,
		port: process.env.STEPNDB_PORT,
		dialect: 'mysql',
		timezone: '+09:00'
	}
);

module.exports = {
	database: sequelize,
	Sequelize: Sequelize
};
