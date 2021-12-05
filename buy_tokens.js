import ethers from "ethers";
import express from "express";
import chalk from "chalk";
import dotenv from "dotenv";
import inquirer from "inquirer";
import { factory, router, account, data, tokenOut, tokenIn } from "./helper.js";
import { getTokenPrice } from "./get_price.js";

const app = express();
dotenv.config();

let initialLiquidityDetected = false;
let jmlBnb = 0;

const expectedTokenPrice = process.env.EXPECTED_TOKEN_PRICE;

const erc = new ethers.Contract(
  data.BNB,
  [
    {
      constant: true,
      inputs: [{ name: "_owner", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "balance", type: "uint256" }],
      payable: false,
      type: "function",
    },
  ],
  account
);

const run = async () => {
  await checkLiq();
};

let checkLiq = async () => {
  const pairAddressx = await factory.getPair(tokenIn, tokenOut);
  console.log(chalk.blue(`pairAddress: ${pairAddressx}`));
  if (pairAddressx !== null && pairAddressx !== undefined) {
    if (pairAddressx.toString().indexOf("0x0000000000000") > -1) {
      console.log(
        chalk.cyan(`pairAddress ${pairAddressx} not detected. Auto restart`)
      );
      return await run();
    }
  }
  const pairBNBvalue = await erc.balanceOf(pairAddressx);
  jmlBnb = ethers.utils.formatEther(pairBNBvalue);
  console.log(`Liquidity : ${jmlBnb * 2}`);

  if (parseFloat(jmlBnb) > parseFloat(data.minBnb)) {
    setTimeout(() => buyAction(), 1000);
  } else {
    initialLiquidityDetected = false;
    console.log(" run again...");
    return await run();
  }
};

let buyAction = async () => {
  if (initialLiquidityDetected === true) {
    console.log("not buy cause already buy");
    return null;
  }

  chalk.green("\nReady to buy\n");
  try {
    initialLiquidityDetected = true;

    let amountOutMin = 0;
    const amountIn = ethers.utils.parseUnits(`${data.AMOUNT_OF_BNB}`, "ether");
    if (parseInt(data.Slippage) !== 0) {
      const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      // amountOutMin = amounts[1].sub(amounts[1].div(`${data.Slippage}`))
      amountOutMin = amounts[1];
    }

    var tokenPrice;
    tokenPrice = await getTokenPrice();

    console.log(
      chalk.yellow(
        `tokenPrice: ${tokenPrice} expectedTokenPrice: ${expectedTokenPrice}`
      )
    );

    if (process.argv[2] === "--limit") {
      while (expectedTokenPrice >= tokenPrice) {
        tokenPrice = await getTokenPrice();
        console.log(
          chalk.yellow(
            `tokenPrice: ${tokenPrice} expectedTokenPrice: ${expectedTokenPrice}`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(
      chalk.green.inverse(`Start to buy \n`) +
        `Buying Token
        =================
        tokenIn: ${(amountIn * 1e-18).toString()} ${tokenIn} (BNB)
        tokenOut: ${ethers.utils.formatEther(amountOutMin)} ${tokenOut}
      `
    );

    console.log("Processing Transaction.....");
    console.log(chalk.yellow(`amountIn: ${amountIn * 1e-18} (BNB)`));
    console.log(
      chalk.yellow(`amountOutMin: ${ethers.utils.formatEther(amountOutMin)}`)
    );
    console.log(chalk.yellow(`tokenIn: ${tokenIn} (BNB)`));
    console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
    console.log(chalk.yellow(`Recipient: ${data.recipient}`));

    // const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment this if you want to buy deflationary token
    const tx = await router.swapETHForExactTokens(
      //uncomment here if you want to buy token
      amountOutMin,
      [tokenIn, tokenOut],
      data.recipient,
      Date.now() + 1000 * 60 * 5, //5 minutes
      {
        value: amountIn,
        gasLimit: process.env.GAS_LIMIT,
        gasPrice: ethers.utils.parseUnits(`${process.env.GWEI}`, "gwei"),
      }
    );

    const receipt = await tx.wait();
    console.log(
      `Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`
    );
    setTimeout(() => {
      process.exit();
    }, 2000);
  } catch (err) {
    let error = JSON.parse(JSON.stringify(err));
    console.log(`Error caused by : 
        {
        reason : ${error.reason},
        transactionHash : ${error.transactionHash}
        message : ${error}
        }`);
    console.log(error);

    inquirer
      .prompt([
        {
          type: "confirm",
          name: "runAgain",
          message: "Do you want to run again thi bot?",
        },
      ])
      .then((answers) => {
        if (answers.runAgain === true) {
          console.log(
            "= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ="
          );
          console.log("Run again");
          console.log(
            "= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ="
          );
          initialLiquidityDetected = false;
          run();
        } else {
          process.exit();
        }
      });
  }
};

run();
const PORT = 5001;

app.listen(
  PORT,
  console.log(
    chalk.yellow(
      `Listening for Liquidity Addition to token ${data.to_PURCHASE}`
    )
  )
);
