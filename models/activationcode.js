'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const db = loader.database.define('code', {
	code: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false
	},
	enable: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
}, {
	freezeTableName: true,
	timestamps: true
});

module.exports = db;
