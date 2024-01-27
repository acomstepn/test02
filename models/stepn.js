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

	head: {
		type: Sequelize.BOOLEAN,
		defaultValue: true
	},
	action: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	debitAccount: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	debitAmount: {
		type: Sequelize.BIGINT,
		defaultValue: 0
	},
	debitCurrency: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	creditAccount: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	creditAmount: {
		type: Sequelize.BIGINT,
		defaultValue: 0
	},
	creditCurrency: {
		type: Sequelize.INTEGER,
		defaultValue: 0
	},
	link: {
		type: Sequelize.INTEGER,
		defaultValue: 0
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
