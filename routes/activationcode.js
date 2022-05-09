'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const ActivationCode = require('../models/activationcode');

const title = 'カードローン地獄の成れの果て';

async function find() {
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
	return items;
}

router.get('/', async (req, res, next) => {
	const items = await find();
	res.render('activationcode', { title: title, items: items });
});

router.post('/', async (req, res, next) => {
	if(global.idn === process.env.ADMIN_ID) {
		const cmd = req.body.cmd;
		if (cmd === 'add') {
			await ActivationCode.create({ code: req.body.code });
		} else if (cmd === 'disable') {
			if (req.body.code) {
				await ActivationCode.update({ enable: false }, { where: { code: req.body.code } });
			}
		}
	}

	const items = await find();
	res.render('activationcode', { title: title, items: items });
});

module.exports = router;
