'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Shoe = require('../models/shoe');

const imgdir = '/images/shoes';
const destDir = `public${imgdir}`;
const upload = multer({ inMemory: true });

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true });
}

router.get('/', async (req, res, next) => {
	const items = await Shoe.findAll();
	res.render('shoeedit', { moment: moment, imgdir: imgdir, items: items });
});

router.get('/new', async (req, res, next) => {
	res.render('shoeeditnew', { moment: moment, imgdir: imgdir });
});

router.get('/:id', async (req, res, next) => {
	const id = req.params.id;
	const shoe = await Shoe.findByPk(id);
	res.render('shoeeditedit', { moment: moment, imgdir: imgdir, shoe: shoe });
});

router.post('/update', (req, res, next) => {
	if (global.isAdmin(req)) {
		next();
	} else {
		res.redirect('/shoeedit');
	}
}, upload.single('file'), async (req, res, next) => {
	const id = req.body.id;
	if (parseInt(id) > 0) {
		const shoe = {
			id: id,
			enable: req.body.enable ? true : false,
			image: req.body.image ? true : false,
			class: req.body.class,
			baseeffi: 10*req.body.effi,
			baseluck: 10*req.body.luck,
			basecomf: 10*req.body.comf,
			baseresi: 10*req.body.resi,
			createdAt: req.body.createdAt
		};
		if (req.file) {
			await (() => {
				const width = 0x200;
				const height = 0x180;
				return sharp(req.file.buffer)
					.extract({
						left: (1080-width)/2,
						top: 0x2c0,
						width: width,
						height: height
					})
					.resize(width/2, height/2)
					.toFile(`${destDir}/${id}.png`);
			})();
			shoe.image = true;
		}
		await Shoe.upsert(shoe);
	}
	res.redirect('/shoeedit');
});

module.exports = router;
