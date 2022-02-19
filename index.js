const ethers = require("ethers");
const dotenv = require("dotenv");
const _ = require("lodash");
const axios = require("axios");
const fetchStatus = {
  status: "active",
};
dotenv.config();

const RENA_CONTRACT = "0xa9d75cc3405f0450955050c520843f99aff8749d";
const GEAR_CONTRACT = "0xb4404dab7c0ec48b428cf37dec7fb628bcc41b36";
const CHMB_CONTRACT = "0x5492ef6aeeba1a3896357359ef039a8b11621b45";
const TBL_CONTRACT = "0x59f6b2435cd1421f409907ad2d9f811849ca555f";
const ZWZ_CONTRACT = "0x5445451c07e20ba1ca887b6c74d66d358f46d083";
let coinList = [];

const BOT_TOKEN = process.env.BOT_TOKEN;
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const data = {
  router: process.env.ROUTER, //PancakeSwap V2 router
  routerEther: process.env.ROUTER_ETHER,
  routerFantom: process.env.ROUTER_FANTOM,
};

const wss = process.env.WSS_NODE;
const wssEther = process.env.WSS_NODE_ETHER;
const wssFantom = process.env.WSS_NODE_FANTOM;

const tokens = {
  BNB: process.env.WBNB_CONTRACT,
  USDT: process.env.USDT_CONTRACT,
  ETH: process.env.WETH_CONTRACT,
  USDT_ETH: process.env.USDT_CONTRACT_ETHER,
  FTM: process.env.FANTOM_CONTRACT,
  USDC: process.env.USDC_CONTRACT_FANTOM,
};

// BSC
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(wss);
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);
const router = new ethers.Contract(
  data.router,
  [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  ],
  account
);

// ETH
// const providerETH = new ethers.providers.JsonRpcProvider(wssEther);
// const walletETH = new ethers.Wallet(privateKey);
// const accountETH = walletETH.connect(providerETH);
// const routerETH = new ethers.Contract(
//   data.routerEther,
//   [
//     "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
//   ],
//   accountETH
// );

// FTM
// const providerFTM = new ethers.providers.JsonRpcProvider(wssFantom);
// const walletFTM = new ethers.Wallet(privateKey);
// const accountFTM = walletFTM.connect(providerFTM);
// const routerFTM = new ethers.Contract(
//   data.routerFantom,
//   [
//     "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
//   ],
//   accountFTM
// );

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 4, // (causes 2500.99 to be printed as $2,501)
});

// const formatterVol = new Intl.NumberFormat("en-US", {
//   style: "currency",
//   currency: "USD",

//   // These options are needed to round to whole numbers if that's what you want.
//   minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
//   maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
// });

const ABIDecimal = ["function decimals() view returns (uint8)"];

// async function getPriceUSDT(inputCurrency, outputCurrency = tokens.USDT) {
//   const amounts = await router.getAmountsOut(ethers.utils.parseUnits("1", 18), [
//     inputCurrency,
//     outputCurrency,
//   ]);
//   const price = amounts[1].toString() / 1e18;
//   return price;
// }

// async function getPriceETH_USDT(
//   inputCurrency,
//   outputCurrency = tokens.USDT_ETH
// ) {
//   const amounts = await routerETH.getAmountsOut(
//     ethers.utils.parseUnits("1", 18),
//     [inputCurrency, outputCurrency]
//   );
//   const price = amounts[1].toString() / 1e6;
//   return price;
// }

// async function getPriceUSDC(inputCurrency, outputCurrency = tokens.USDC) {
//   const amounts = await routerFTM.getAmountsOut(
//     ethers.utils.parseUnits("1", 18),
//     [inputCurrency, outputCurrency]
//   );
//   const price = amounts[1].toString() / 1e6;
//   return price;
// }

async function getPrice(inputCurrency) {
  const getPriceBNB = await router.getAmountsOut(
    ethers.utils.parseUnits("1", 18),
    [tokens.BNB, tokens.USDT]
  );
  const priceBNB = getPriceBNB[1].toString() / 1e18;
  const tokenContract = new ethers.Contract(inputCurrency, ABIDecimal, account);
  const decimals = await tokenContract.decimals();
  const amounts = await router.getAmountsOut(
    ethers.utils.parseUnits("1", decimals),
    [inputCurrency, tokens.BNB]
  );
  const price = amounts[1].toString() / 1e18;
  return [price * priceBNB, priceBNB];
}

// async function getPriceETH(inputCurrency) {
//   const getPriceETH = await routerETH.getAmountsOut(
//     ethers.utils.parseUnits("1", 18),
//     [tokens.ETH, tokens.USDT_ETH]
//   );
//   const priceETH = getPriceETH[1].toString() / 1e6;
//   const tokenContract = new ethers.Contract(inputCurrency, ABIDecimal, accountETH);
//   const decimals = await tokenContract.decimals();
//   const amounts = await routerETH.getAmountsOut(
//     ethers.utils.parseUnits("1", decimals),
//     [inputCurrency, tokens.ETH]
//   );
//   const price = amounts[1].toString() / 1e18;
//   return price * priceETH;
// }

// async function getPriceFTM(inputCurrency) {
//   const getPriceETH = await routerFTM.getAmountsOut(
//     ethers.utils.parseUnits("1", 18),
//     [tokens.FTM, tokens.USDC]
//   );
//   const priceFTM = getPriceETH[1].toString() / 1e6;
//   const tokenContract = new ethers.Contract(inputCurrency, ABIDecimal, accountFTM);
//   const decimals = await tokenContract.decimals();
//   const amounts = await routerFTM.getAmountsOut(
//     ethers.utils.parseUnits("1", decimals),
//     [inputCurrency, tokens.FTM]
//   );
//   const price = amounts[1].toString() / 1e18;
//   return price * priceFTM;
// }

// async function getCoin() {
//   try {
//     fetchStatus.status = "loading";
//     const response = await axios.get(
//       "https://api.coingecko.com/api/v3/coins/list"
//     );
//     coinList = _.get(response, "data") || coinList;
//     fetchStatus.status = "active";
//     console.log("Fetch List Success");
//   } catch (error) {
//     console.log("Fetch fail. Try again");
//     setTimeout(() => getCoin(), 1000);
//   }
// }

// async function getVol24h(id) {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true`
//     );
//     return _.get(response, `data.${id}.usd_24h_vol`, 0);
//   } catch (error) {
//     return 0;
//   }
// }

// async function getAddressBSC(id) {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/coins/${id}`
//     );
//     return _.get(response, `data.platforms[binance-smart-chain]`);
//   } catch (error) {
//     return null;
//   }
// }

// async function getPriceNormal(id) {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
//     );
//     return _.get(response, `data[${id}].usd`);
//   } catch (error) {
//     return 0;
//   }
// }

// async function getAddressETH(id) {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/coins/${id}`
//     );
//     return _.get(response, `data.platforms[ethereum]`);
//   } catch (error) {
//     return null;
//   }
// }

// async function getAddressFTM(id) {
//   try {
//     const response = await axios.get(
//       `https://api.coingecko.com/api/v3/coins/${id}`
//     );
//     return _.get(response, `data.platforms[fantom]`);
//   } catch (error) {
//     return null;
//   }
// }

// getCoin();

// setInterval(() => getCoin(), 60 * 60 * 1000);

// async function sendCoinPrice(matchToken, msg, isEdit = false, opts) {
//   const mapVol = await Promise.all(
//     _.map(matchToken, async (token) => {
//       let vol = 0;
//       try {
//         vol = await getVol24h(token.id);
//       } catch (error) {
//         console.log(error.message);
//       }

//       return {
//         ...token,
//         vol,
//         volFormat: formatterVol.format(vol),
//       };
//     })
//   );
//   const orderByVol = _.slice(_.orderBy(mapVol, ["vol"], ["desc"]), 0, 5);
//   const target = orderByVol.shift();

//   const options = {
//     reply_markup: JSON.stringify({
//       inline_keyboard: _.map(orderByVol, (item) => {
//         return [
//           {
//             text: item.name,
//             callback_data: item.id,
//           },
//         ];
//       }),
//     }),
//     parse_mode: "HTML",
//   };

//   let price = 0;
//   let addressType = null;

//   let address = null;

//   try {
//     address = await getAddressBSC(target.id);
//     if (address) {
//       price = await getPrice(address);
//       addressType = "BSC";
//     } else {
//       // ETH
//       address = await getAddressETH(target.id);
//       if (address) {
//         price = await getPriceETH(address);
//         addressType = "ERC";
//       } else {
//         // FTM
//         address = await getAddressFTM(target.id);
//         if (address) {
//           price = await getPriceFTM(address);
//           addressType = "FTM";
//         } else {
//           price = await getPriceNormal(target.id);
//           addressType = "UNKNOWN";
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error.message);
//     price = await getPriceNormal(target.id);
//     addressType = "UNKNOWN";
//   }

//   // BNB
//   // if (target.id === "binancecoin") {
//   //   price = await getPriceUSDT(tokens.BNB);
//   //   address = null;
//   // }

//   if (target.id === "wbnb") {
//     price = await getPriceUSDT(tokens.BNB);
//     address = tokens.BNB;
//     addressType = "BSC";
//   }
//   if (target.id === "weth") {
//     price = await getPriceETH_USDT(tokens.ETH);
//     address = tokens.ETH;
//     addressType = "ERC";
//   }

//   if (target.id === "wrapped-fantom") {
//     price = await getPriceUSDC(tokens.FTM);
//     address = tokens.FTM;
//     addressType = "FTM";
//   }

//   const textRes = `Token: <strong>${
//     target.name
//   }</strong>\nPrice: <strong>${formatter.format(
//     price
//   )}</strong>\nVol 24h: <strong>${target.volFormat}</strong>${
//     address
//       ? `\nContract: <strong>${
//           address || "UNKNOWN"
//         }</strong>\nNetwork: <strong>${addressType}</strong>`
//       : ""
//   }
// TCD - Trade On News: <a>https://t.me/TCD_Community</a>
//   `;

//   if (isEdit) {
//     await bot.editMessageText(textRes, opts);
//   } else {
//     await bot.sendMessage(msg.chat.id, textRes, options);
//   }
// }

async function getDBSPrice(chatId) {
  const [price1, priceBNB1] = await getPrice(TBL_CONTRACT);
  const [price2, priceBNB2] = await getPrice(CHMB_CONTRACT);
  const [price3, priceBNB3] = await getPrice(GEAR_CONTRACT);
  // const [price4, priceBNB4] = await getPrice(ZWZ_CONTRACT);
  await bot.sendMessage(
    chatId,
    `TBL: <strong>${formatter.format(
      price1
    )}</strong>\nCHMB: <strong>${formatter.format(
      price2
    )}</strong>\nGEAR: <strong>${formatter.format(
      price3
    )}</strong>\nBNB: <strong>${formatter.format(priceBNB1)}</strong>`,
    {
      parse_mode: "HTML",
    }
  );
}

bot.on("message", async (msg) => {
  const text = msg.text;
  // Start
  if (text.match(/^\/start/)) {
    await getDBSPrice(msg.chat.id);
    setInterval(() => getDBSPrice(msg.chat.id), 60000);
    // const token = _.last(_.split(text, " "));
    // const tokenRegex = new RegExp(token, "gi");
    // const matchToken = _.filter(
    //   coinList,
    //   (coin) =>
    //     coin.symbol.match(tokenRegex) && coin.symbol.length === token.length
    // );
    // if (!_.get(matchToken, "length", 0)) {
    //   return bot.sendMessage(msg.chat.id, "Can't find your shit coin");
    // }
    // await sendCoinPrice(matchToken, msg);
  }
});

// bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
//   //   const userId = _.get(callbackQuery, "from.id");
//   const action = callbackQuery.data;
//   const msg = callbackQuery.message;
//   const opts = {
//     chat_id: msg.chat.id,
//     message_id: msg.message_id,
//     parse_mode: "HTML",
//   };

//   const getToken = coinList.find((item) => item.id === action);

//   await sendCoinPrice([getToken], null, true, opts);
// });
