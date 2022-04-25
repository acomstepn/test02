'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const ActivationCode = require('../models/activationcode');

const title = 'カードローン地獄の成れの果て';

ActivationCode.sync();

router.get('/', async (req, res, next) => {
	const rows = await ActivationCode.findAll({
		order: [
			['createdAt', 'DESC']
		]
	});
	const items = [];
	rows.forEach(row => {
		const createdAt = moment(row.createdAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
		items.push({code: row.code, enable: row.enable, createdAt: createdAt});
	});
	res.render('activationcode', { title: title, items: items });
});

module.exports = router;
