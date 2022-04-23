'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const StepnDb = require('../models/stepn');

const title = 'カードローン地獄の成れの果て';

StepnDb.sync({force:false});

router.get('/', async (req, res, next) => {
	const rows = await StepnDb.findAll();
	let GST = 0, GMT = 0, SOL = 0;
	let WGST = 0, WSOL = 0;
	let acom = 0;
	const items = [];

	rows.forEach(row => {
		const id = row.id;
		const kari_kamoku = row.kari_kamoku;
		const kari_price = row.kari_price;
		const kashi_kamoku = row.kashi_kamoku;
		const kashi_price = row.kashi_price;
		const tekiyo = row.tekiyo;
		const createdAt = moment(row.createdAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
		if (kari_kamoku === 'Spending GST') {
			GST += kari_price*100;
		} else if (kari_kamoku === 'Spending GMT') {
			GMT += kari_price*1000000;
		} else if (kari_kamoku === 'Spending SOL') {
			SOL += kari_price*1000000;
		} else if (kari_kamoku === 'Wallet GST') {
			WGST += kari_price*1000000000;
		} else if (kari_kamoku === 'Wallet SOL') {
			WSOL += kari_price*1000000000;
		} else if (kari_kamoku === '借入金') {
			acom -= kari_price;
		}
		if (kashi_kamoku === 'Spending GST') {
			GST -= kashi_price*100;
		} else if (kashi_kamoku === 'Spending GMT') {
			GMT -= kashi_price*1000000;
		} else if (kashi_kamoku === 'Spending SOL') {
			SOL -= kashi_price*1000000;
		} else if (kashi_kamoku === 'Wallet GST') {
			WGST -= kashi_price*1000000000;
		} else if (kashi_kamoku === 'Wallet SOL') {
			WSOL -= kashi_price*1000000000;
		} else if (kashi_kamoku === '借入金') {
			acom += kashi_price;
		}
		const text = `${GST/100} GST ${GMT/1000000} GMT ${SOL/1000000} SOL`;
		const wallet = '';
		items.unshift({ id: id, kari_kamoku: kari_kamoku, kari_price: kari_price, kashi_kamoku: kashi_kamoku, kashi_price: kashi_price, tekiyo: tekiyo, text: text, wallet: wallet, createdAt: createdAt });
	});

	res.render('stepn', { title: title, items: items });
});

module.exports = router;
