const hre = require("hardhat");
const { ethers } = hre;

let transactionCount = 0;

async function main() {
  ethers.provider.on('block', async (blockNumber) => {
    const block = await ethers.provider.getBlock(blockNumber);
    console.log(`> New block ${blockNumber}`);

    transactionCount += block.transactions.length;
    console.log(`  total transactions: ${transactionCount}`);
  });

  await new Promise(() => {});
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
