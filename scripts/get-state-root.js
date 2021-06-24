const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // Get state root
  const block = await ethers.provider.getBlock();
  const blockNumberHex = `0x${block.number.toString(16)}`;
  const blockFull = await ethers.provider.send('eth_getBlockByNumber', [blockNumberHex, false]);
  console.log('> stateRoot:', blockFull.stateRoot);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
