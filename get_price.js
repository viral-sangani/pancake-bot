import { tokenIn, tokenOut, router } from "./helper.js";
import ethers from "ethers";

export const getTokenPrice = async () => {
  const bnbAddress = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
  const busdAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

  let amountOutMin = 0;
  let amountOutBNBMin = 0;
  const amountIn = ethers.utils.parseUnits(`1`, "ether");

  const tokenAmounts = await router.getAmountsOut(amountIn, [
    tokenOut,
    tokenIn,
  ]);
  amountOutMin = tokenAmounts[1];

  const bnbBusdAmounts = await router.getAmountsOut(amountIn, [
    bnbAddress,
    busdAddress,
  ]);
  amountOutBNBMin = bnbBusdAmounts[1];

  var formattedAmountOutMin = ethers.utils.formatEther(amountOutMin);
  var formattedAmoutOutBNBMin = ethers.utils.formatEther(amountOutBNBMin);

  var tokenPrice =
    parseFloat(formattedAmountOutMin) * parseFloat(formattedAmoutOutBNBMin);
  return tokenPrice;
};
