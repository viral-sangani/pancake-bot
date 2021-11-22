import ethers from "ethers";
import dotenv from "dotenv";
dotenv.config();

const wss = process.env.WSS_NODE;
const mnemonic = process.env.YOUR_MNEMONIC;
const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);

export const account = wallet.connect(provider);

export const data = {
  BNB: process.env.BNB_CONTRACT, //bnb

  to_PURCHASE: process.env.TO_PURCHASE, // token that you will purchase = BUSD for test '0xe9e7cea3dedca5984780bafc599bd69add087d56'

  AMOUNT_OF_BNB: process.env.AMOUNT_OF_BNB, // how much you want to buy in BNB

  factory: process.env.FACTORY, //PancakeSwap V2 factory

  router: process.env.ROUTER, //PancakeSwap V2 router

  recipient: process.env.YOUR_ADDRESS, //your wallet address,

  Slippage: process.env.SLIPPAGE, //in Percentage

  gasPrice: ethers.utils.parseUnits(`${process.env.GWEI}`, "gwei"), //in gwei

  gasLimit: process.env.GAS_LIMIT, //at least 21000

  minBnb: process.env.MIN_LIQUIDITY_ADDED, //min liquidity added

  AMOUNT_OF_TOKEN: process.env.AMOUNT_OF_TOKEN, //how much you want to sell in token
};

export const tokenIn = data.BNB;
export const tokenOut = data.to_PURCHASE;

export const factory = new ethers.Contract(
  data.factory,
  [
    "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  ],
  account
);

export const router = new ethers.Contract(
  data.router,
  [
    "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)",
    "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external",
  ],
  account
);
