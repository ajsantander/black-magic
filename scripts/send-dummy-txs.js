const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const numTxs = process.env.NUM_TXS;
  console.log(`Sending ${numTxs} dummy txs...`);

  const signer = (await ethers.getSigners())[0];

  for (let i = 0; i < numTxs; i++) {
    console.log(`Sending tx ${i}`);

    const tx = await signer.sendTransaction({
      value: 0,
      gasPrice: 0,
      to: signer.address,
    });
    await tx.wait();
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
