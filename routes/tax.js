'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const StepnDb = require('../models/stepn');
const { Op } = require('sequelize');
const rates = require('../rates.js');
const MAG = 1000000000;

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

router.get('/:year', async (req, res, next) => {
	const year = (req.params.year < 2022) ? 2022 : (req.params.year > 2023) ? 2023 : req.params.year;
	const rows = await StepnDb.findAll({
		where: {
			createdAt: {
				[Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
			}
		}
	});

	const curtb = [ 'JPY', 'BTC', 'SOL', 'BNB', 'ETH', 'USDT', 'sGST', 'bGST', 'eGST', 'GMT' ];
	let curMAX = 0;
	const curJPY  = curMAX++;	// 0
	const curBTC  = curMAX++;	// 1
	const curSOL  = curMAX++;	// 2
	const curBNB  = curMAX++;	// 3
	const curETH  = curMAX++;	// 4
	const curUSDC = curMAX++;	// 5
	const cursGST = curMAX++;	// 6
	const curbGST = curMAX++;	// 7
	const cureGST = curMAX++;	// 8
	const curGMT  = curMAX++;	// 9
	const coins = Array.from(Array(curMAX), () => ({name: '', amount: 0, price: 0, ave: 0}));
	for (let i = 0; i < curMAX; i++) {
		coins[i].name = curtb[i];
	}
	const accsum = [
		{err: 0}
	];
	rows.forEach(row => {
		const action = row.action;
		const debitAccount = row.debitAccount;
		const debitAmount = row.debitAmount;
		const debitCurrency = row.debitCurrency;
		const creditAccount = row.creditAccount;
		const creditAmount = row.creditAmount;
		const creditCurrency = row.creditCurrency;


		if (action > 0) {
			function toJPY(amount, cur) {
				switch (cur) {
					case curJPY:
						return amount;
					case curBTC:
						return amount*rates.btc[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case curSOL:
						return amount*rates.sol[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case curBNB:
						return amount*rates.bnb[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case curETH:
						return amount*rates.eth[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case curUSDC:
						return amount*rates.usdc[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case cursGST:
						return amount*rates.sgst[moment(row.createdAt).diff(moment('2022-01-01'), 'day')];
					case curbGST:
						return amount*rates.bgst[moment(row.createdAt).diff(moment('2022-05-23'), 'day')];
					case cureGST:
						return amount*rates.egst[moment(row.createdAt).diff(moment('2022-07-28'), 'day')];
					case curGMT:
						return amount*rates.gmt[moment(row.createdAt).diff(moment('2022-03-09'), 'day')];
					default:
						accsum[0].err += 16;
						break;
				}
				return 0;
			}
			const creditJPY = toJPY(creditAmount, creditCurrency);

			switch(debitAccount) {
				case 1:	// 現金
				case 2:	// 借入金
				case 3:	// 普通口座
					switch(creditAccount) {
						case 1:	// 現金
						case 2:	// 借入金
						case 3:	// 普通口座
						case 15:	// Liquid
							if (debitCurrency != creditCurrency) {
								accsum[0].err++;
							}
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 4:	// CoinCheck
				case 5:	// Binance
				case 15:	// Liquid
					if (debitAccount == creditAccount) {
						if (debitCurrency != creditCurrency) {
							coins[debitCurrency].amount += debitAmount;
							if (creditCurrency == curJPY) {
								coins[debitCurrency].price += creditAmount;
							} else {
								coins[debitCurrency].price += creditJPY;
							}
						} else {
							accsum[0].err++;
						}
					} else {
						switch(creditAccount) {
							case 3:	// 普通口座
							case 4:	// CoinCheck
							case 6:	// Wallet Solana
								if (debitCurrency != creditCurrency) {
									accsum[0].err++;
								}
								break;
							default:
								accsum[0].err++;
								break;
						}
					}
					break;

				case 6:	// Wallet Solana
				case 35:	// Wallet BSC
				case 60:	// Wallet ETH
					switch(creditAccount) {
						case 0:	//
							if (!(debitCurrency == curUSDC && creditCurrency == 0)) {
								accsum[0].err++;
							}
							break;
						case 4:	// CoinCheck
						case 5:	// Binance
						case 7:	// Spending Solana
						case 36:	// Spending BSC
						case 61:	// Spending ETH
							if (debitCurrency != creditCurrency) {
								accsum[0].err++;
							}
							break;
						case 6:	// Wallet Solana
						case 35:	// Wallet BSC
							if (debitCurrency != creditCurrency) {
								coins[debitCurrency].amount += debitAmount;
								coins[debitCurrency].price += creditJPY;
							} else {
								accsum[0].err++;
							}
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 7:	// Spending Solana
				case 36:	// Spending BSC
				case 61:	// Spending ETH
					switch(creditAccount) {
						case 6:	// Wallet Solana
						case 35:	// Wallet BSC
						case 60:	// Wallet ETH
							if (debitCurrency != creditCurrency) {
								accsum[0].err++;
							}
							break;
						case 12:	// SOLムーブ
						case 18:	// SOL靴売却
						case 25:	// SOL謎箱
						case 31:	// SOLスクロール売却
						case 34:	// SOLジェム売却
						case 39:	// BSCムーブ
						case 58:	// BSCジェム売却
						case 76:	// BSCスクロール売却
						case 44:	// BSC謎箱
						case 59:	// ETHムーブ
						case 72:	// ETH靴売却
						case 77:	// ETHスクロール売却
						case 68:	// ETH謎箱
							coins[debitCurrency].amount += debitAmount;
							coins[debitCurrency].price += creditJPY;
							break;
							break;
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 9:	// コインチェック送金手数料
				case 10:	// バイナンス送金手数料
				case 16:	// リキッド送金手数料JPY
				case 11:	// SOL手数料
				case 37:	// BNB手数料
				case 64:	// ETH手数料
					switch(creditAccount) {
						case 4:	// CoinCheck
						case 5:	// Binance
						case 15:	// Liquid
						case 6:	// Wallet Solana
						case 35:	// Wallet BSC
						case 60:	// Wallet ETH
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;
				case 21:	// sGST手数料
				case 41:	// bGST手数料
				case 65:	// eGST手数料
				case 19:	// Artist Royalties
				case 20:	// Transaction Fee
					switch(creditAccount) {
						case 7:	// Spending Solana
						case 36:	// Spending BSC
						case 61:	// Spending ETH
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;
				case 17:	// 支払利息
					switch(creditAccount) {
						case 1:	// 現金
						case 3:	// 普通口座
							if (debitCurrency != creditCurrency) {
								accsum[0].err++;
							}
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 8:	// SOL靴購入
				case 13:	// SOLレベルアップ
				case 14:	// SOL修繕費
				case 22:	// SOLミント
				case 23:	// SOLブースト
				case 24:	// SOL謎箱オープン
				case 32:	// SOLソケットオープン
				case 33:	// SOLパリチャレ
				case 38:	// BSC靴購入
				case 40:	// BSCレベルアップ
				case 42:	// BSC修繕費
				case 43:	// BSC謎箱オープン
				case 62:	// BSCパリチャレ
				case 69:	// BSCソケットオープン
				case 63:	// ETHパリチャレ
				case 66:	// ETH靴購入
				case 67:	// ETH謎箱オープン
				case 70:	// ETHソケットオープン
				case 73:	// ETH修繕費
				case 74:	// ETHレベルアップ
					switch(creditAccount) {
						case 7:	// Spending Solana
						case 36:	// Spending BSC
						case 61:	// Spending ETH
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 26:	// sEfficiencyGem
				case 27:	// sLuckGem
				case 28:	// sComfortGem
				case 29:	// sResilienceGem
				case 30:	// sMintScroll
				case 46:	// bEfficiencyGem
				case 47:	// bLuckGem
				case 48:	// bComfortGem
				case 49:	// bResilienceGem
				case 51:	// bMintScroll
				case 52:	// eEfficiencyGem
				case 53:	// eLuckGem
				case 54:	// eComfortGem
				case 55:	// eResilienceGem
				case 57:	// eMintScroll
					switch(creditAccount) {
						case 25:	// SOL謎箱
						case 44:	// BSC謎箱
						case 68:	// ETH謎箱
							break;
						default:
							accsum[0].err++;
							break;
					}
					break;

				case 0:	// 利息
					switch(row.id) {
						case 1026:
							break;
						default:
							accsum[0].err += 64;
							break;
					}
					break;
				default:
			 		accsum[0].err++;
					break;
			}
		} else {
			 accsum[0].err++;
		}
		if(accsum[0].err > 0) {
			console.log('**** error ****', row.id, row.createdAt);;
			accsum[0].err = 0;
		}
	});
	for (let i = 0; i < curMAX; i++) {
		if (coins[i].amount > 0)
			coins[i].ave = coins[i].price/coins[i].amount;
	}

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

	res.render('tax', {
		items: items,
		coins: coins
	});
});

module.exports = router;
