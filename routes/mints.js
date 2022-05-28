'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Stepn = require('../models/stepn');
const Shoe = require('../models/shoe');

router.get('/', async (req, res, next) => {
	const shoeData = [];
	const rowsShoe = await Shoe.findAll();
	rowsShoe.forEach(row => {
			shoeData[`#${row.id}`] = { id: `#${row.id}`, type: row.type, class: row.class};
	});

	const rows = await Stepn.findAll({
		where: {
			kari_kamoku: 'Mint'
		},
		order: [['id', 'DESC']]
	});
	let GST = 0, GMT = 0;
	const items = [];

	rows.forEach(row => {
		const id = row.id;
		const kari_kamoku = row.kari_kamoku;
		const kari_price = row.kari_price;
		const kashi_kamoku = row.kashi_kamoku;
		const kashi_price = row.kashi_price;
		const tekiyo = row.tekiyo;
		const createdAt = moment(row.createdAt).format('YYYY-MM-DD HH:mm');

		const shoeIds = tekiyo.match(/#(\d+)/g);

		if (kashi_kamoku === 'Spending GST') {
			GST += kashi_price;
		} else if (kashi_kamoku === 'Spending GMT') {
			GMT += kashi_price;
		}
		if (shoeIds) {
			const shoes = [];
			shoeIds.forEach(shoeId => {
				shoes.push(shoeData[shoeId]);
			});

			items.unshift({
				id: id,
				kari_kamoku: kari_kamoku,
				kari_price: row.kari_price,
				kashi_kamoku: kashi_kamoku,
				kashi_price: row.kashi_price,
				tekiyo: tekiyo,
				gst: GST,
				gmt: GMT,
				createdAt: createdAt,
				shoes: shoes
			});
		}
		if (shoeIds) {
			GST = 0;
			GMT = 0;
		}
	});

	res.render('mints', { items: items });
});

module.exports = router;
