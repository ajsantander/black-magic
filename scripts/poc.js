const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const target = 100;
  const numTxs = process.env.NUM_TXS;
  const delta = target / numTxs;
  if (Math.floor(delta) !== delta) {
    throw new Error(`100 / NUM_TXS needs to be an integer and is ${delta}`);
  }
  console.log(`Running with ${numTxs} txs...`);

  // Deploy
  const Larry = await ethers.getContractFactory('Larry');
  const larry = await Larry.deploy();
  await larry.deployed();

  let blocks = 0;
  const staticTxMum = 10;

  const signer = (await ethers.getSigners())[0];

  // Run txs
  let tx;
  for (let i = 0; i < numTxs; i++) {
    console.log(`> Tx #${i}`);

    const block = await ethers.provider.getBlock();
    console.log(`  block #: ${block.number}`);
    console.log(`  block time: ${block.timestamp}`);

    tx = await larry.age(delta, {
      gasPrice: 0,
    });
    await tx.wait();

    console.log(`  Larry is ${await larry.yearsLived()}`);

    blocks++;
  }
  console.log(`> Larry is finally ${await larry.yearsLived()}`);

  for (let i = 0; staticTxMum - blocks; i++) {
    const tx = await signer.sendTransaction({
      value: 0,
      gasPrice: 0,
      to: signer.address,
    });
    await tx.wait();

    blocks++;
  }
  console.log(`> blocks mined: ${blocks}`);

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
