'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const db = loader.database.define(process.env.STEPNDB_TB, {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	kari_kamoku: {
		type: Sequelize.STRING
	},
	kari_price: {
		type: Sequelize.DOUBLE
	},
	kashi_kamoku: {
		type: Sequelize.STRING
	},
	kashi_price: {
		type: Sequelize.DOUBLE
	},
	tekiyo: {
		type: Sequelize.STRING
	}
}, {
	freezeTableName: true,
	timestamps: true
});

module.exports = db;
