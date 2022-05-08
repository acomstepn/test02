'use strict';
const crypto = require('crypto');
const property = 'idn';

function handler(req, res, next) {
	const md5 = crypto.createHash('md5');
	const maxAge = 1000*60*60*24*365;

	const ip = req.connection.remoteAddress.slice(0, 15);
	const now = Math.floor(Date.now()/1000);
	const id = req.cookies[property] || md5.update(ip+now).digest('hex');
	res.cookie(property, id, {maxAge: maxAge});
	global[property] = id;

	next();
}

module.exports = () => handler;
