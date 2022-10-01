'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const StepnDb = require('../models/stepn');
const Op = require('sequelize').Op;

const n2s = (val) => {
	let sign = '';
	if (val < 0) {
		val = -val;
		sign = '-';
	}
	let v0 = val%1000000000;
	const v1 = (val-v0)/1000000000%1000;
	const v2 = (((val-v0)/1000000000)-v1)/1000%1000;
	if (v0 === 0) {
		if(v2 === 0) {
			return `${sign}${v1}`;
		} else {
			return `${sign}${v2},${('00'+v1).slice(-3)}`;
		}
	} else {
		let fig = 9;
		while (v0%10 === 0) {
			v0 /= 10;
			fig--;
		}
		if(v2 === 0) {
			return `${sign}${v1}.${('00000000'+v0).slice(-fig)}`;
		} else {
			return `d:${sign}${v2},${('00'+v1).slice(-3)}.${('00000000'+v0).slice(-fig)}`;
		}
	}
}

router.get('/', async (req, res, next) => {
	const rows = await StepnDb.findAll();
	let GST = 0, GMT = 0, SOL = 0;
	let WGST = 0, WGMT = 0, WSOL = 0, USDC = 0;
	let bGST = 0, bGMT = 0, BNB = 0;
	let bWGST = 0, bWGMT = 0, WBNB = 0, bUSDC = 0;
	let acom = 0;
	const items = [];

	rows.forEach(row => {
		const id = row.id;
		const kari_kamoku = row.kari_kamoku;
		const kari_price = Math.round(row.kari_price*1000000000);
		const kashi_kamoku = row.kashi_kamoku;
		const kashi_price = Math.round(row.kashi_price*1000000000);
		const tekiyo = row.tekiyo.replace(/#(\d+)/g, '<a href="/shoe/$1">#$1</a>');
		const createdAt = moment(row.createdAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
		if (kari_kamoku === 'Spending GST') {
			GST += kari_price;
		} else if (kari_kamoku === 'Spending GMT') {
			GMT += kari_price;
		} else if (kari_kamoku === 'Spending SOL') {
			SOL += kari_price;
		} else if (kari_kamoku === 'Wallet GST') {
			WGST += kari_price;
		} else if (kari_kamoku === 'Wallet GMT') {
			WGMT += kari_price;
		} else if (kari_kamoku === 'Wallet SOL') {
			WSOL += kari_price;
		} else if (kari_kamoku === 'Wallet USDC') {
			USDC += kari_price;

		} else if (kari_kamoku === 'Spending bGST') {
			bGST += kari_price;
		} else if (kari_kamoku === 'Spending bGMT') {
			bGMT += kari_price;
		} else if (kari_kamoku === 'Spending BNB') {
			BNB += kari_price;
		} else if (kari_kamoku === 'Wallet bGST') {
			bWGST += kari_price;
		} else if (kari_kamoku === 'Wallet bGMT') {
			bWGMT += kari_price;
		} else if (kari_kamoku === 'Wallet BNB') {
			WBNB += kari_price;
		} else if (kari_kamoku === 'Wallet bUSDC') {
			bUSDC += kari_price;

		} else if (kari_kamoku === '借入金') {
			acom -= kari_price;
		}
		if (kashi_kamoku === 'Spending GST') {
			GST -= kashi_price;
		} else if (kashi_kamoku === 'Spending GMT') {
			GMT -= kashi_price;
		} else if (kashi_kamoku === 'Spending SOL') {
			SOL -= kashi_price;
		} else if (kashi_kamoku === 'Wallet GST') {
			WGST -= kashi_price;
		} else if (kashi_kamoku === 'Wallet GMT') {
			WGMT -= kashi_price;
		} else if (kashi_kamoku === 'Wallet SOL') {
			WSOL -= kashi_price;
		} else if (kashi_kamoku === 'Wallet USDC') {
			USDC -= kashi_price;

		} else if (kashi_kamoku === 'Spending bGST') {
			bGST -= kashi_price;
		} else if (kashi_kamoku === 'Spending bGMT') {
			bGMT -= kashi_price;
		} else if (kashi_kamoku === 'Spending BNB') {
			BNB -= kashi_price;
		} else if (kashi_kamoku === 'Wallet bGST') {
			bWGST -= kashi_price;
		} else if (kashi_kamoku === 'Wallet bGMT') {
			bWGMT -= kashi_price;
		} else if (kashi_kamoku === 'Wallet BNB') {
			WBNB -= kashi_price;
		} else if (kashi_kamoku === 'Wallet bUSDC') {
			bUSDC -= kashi_price;

		} else if (kashi_kamoku === '借入金') {
			acom += kashi_price;
		}
		items.unshift({
			id: id,
			kari_kamoku: kari_kamoku,
			kari_price: row.kari_price,
			kashi_kamoku: kashi_kamoku,
			kashi_price: row.kashi_price,
			tekiyo: tekiyo,

			solana: {
				gst: n2s(GST),
				gmt: n2s(GMT),
				sol: n2s(SOL),
				wsol: n2s(WSOL),
				wgst: n2s(WGST),
				wgmt: n2s(WGMT),
				usdc: n2s(USDC)
			},
			bsc: {
				gst: n2s(bGST),
				gmt: n2s(bGMT),
				bnb: n2s(BNB),
				wbnb: n2s(WBNB),
				wgst: n2s(bWGST),
				wgmt: n2s(bWGMT),
				usdc: n2s(bUSDC)
			},

			acom: n2s(acom),
			createdAt: createdAt
		});
	});

	res.render('stepn', { items: items });
});

router.get('/shoe/:id', async (req, res, next) => {
	const id = req.params.id;
	const rows = await StepnDb.findAll({
		where: {
			tekiyo: {
				[Op.like]: `%#${id}%`
			}
		}
	});
	let GST = 0, GMT = 0, SOL = 0;
	let WGST = 0, WGMT = 0, WSOL = 0, USDC = 0;
	let bGST = 0, bGMT = 0, BNB = 0;
	let bWGST = 0, bWGMT = 0, WBNB = 0, bUSDC = 0;
	let acom = 0;
	const items = [];

	rows.forEach(row => {
		const id = row.id;
		const kari_kamoku = row.kari_kamoku;
		const kari_price = Math.round(row.kari_price*1000000000);
		const kashi_kamoku = row.kashi_kamoku;
		const kashi_price = Math.round(row.kashi_price*1000000000);
		const tekiyo = row.tekiyo.replace(/#(\d+)/g, '<a href="/shoe/$1">#$1</a>');
		const createdAt = moment(row.createdAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
		items.unshift({
			id: id,
			kari_kamoku: kari_kamoku,
			kari_price: row.kari_price,
			kashi_kamoku: kashi_kamoku,
			kashi_price: row.kashi_price,
			tekiyo: tekiyo,

			solana: {
				gst: n2s(GST),
				gmt: n2s(GMT),
				sol: n2s(SOL),
				wsol: n2s(WSOL),
				wgst: n2s(WGST),
				wgmt: n2s(WGMT),
				usdc: n2s(USDC)
			},
			bsc: {
				gst: n2s(bGST),
				gmt: n2s(bGMT),
				bnb: n2s(BNB),
				wbnb: n2s(WBNB),
				wgst: n2s(bWGST),
				wgmt: n2s(bWGMT),
				usdc: n2s(bUSDC)
			},

			acom: n2s(acom),
			createdAt: createdAt
		});
	});

	res.render('stepn', { items: items });
});

module.exports = router;
