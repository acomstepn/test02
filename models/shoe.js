'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const db = loader.database.define('shoe', {
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false
	},
	enable: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: true
	},
	image: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	type: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	class: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	quality: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	durability: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	level: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	mint: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	baseeffi: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	baseluck: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	basecomf: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	baseresi: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	effi: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	luck: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	comf: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	resi: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	socket0: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	socket1: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	socket2: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	socket3: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	availablepts: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	mintedfrom0: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	mintedfrom1: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	mints: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: ''
	}
}, {
	freezeTableName: true,
	timestamps: true
});

module.exports = db;
