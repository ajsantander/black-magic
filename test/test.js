const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('larry', function() {
  let signer;
  let larry;
  let snapshotId;
  let stateRootA, stateRootB;

  const overrides = {
    gasPrice: 0,
  };

  async function _getStateRoot() {
    const block = await ethers.provider.getBlock();

    const blockNumberHex = `0x${block.number.toString(16)}`;

    // Getting a block at a lower level, directly via the json-rpc provides more data.
    const blockFull = await ethers.provider.send('eth_getBlockByNumber', [blockNumberHex, false]);

    return blockFull.stateRoot;
  }

  before('get signer', async () => {
    signer = (await ethers.getSigners())[0];
  });

  before('deploy', async () => {
    const Larry = await ethers.getContractFactory('Larry');

    larry = await Larry.deploy();
    await larry.deployed();
  });

  before('take a snapshot', async () => {
    snapshotId = await ethers.provider.send('evm_snapshot');
  });

  it('shows that larry is 0', async () => {
    const years = await larry.yearsLived();

    expect(years.toString()).to.be.equal('0');
  });

  describe('when making larry 42 via 2 transactions', () => {
    before('make larry age', async () => {
      let tx;

      tx = await larry.age(20, overrides);
      await tx.wait();

      tx = await larry.age(22, overrides);
      await tx.wait();
    });

    it('makes larry 42', async () => {
      const years = await larry.yearsLived();

      expect(years.toString()).to.be.equal('42');
    });

    it('gets the state root', async () => {
      stateRootA = await _getStateRoot();
    });

    describe('when rewinding', () => {
      before('restore the snapshot', async () => {
        await ethers.provider.send('evm_revert', [snapshotId]);
      });

      it('shows that larry is 0 again', async () => {
        const years = await larry.yearsLived();

        expect(years.toString()).to.be.equal('0');
      });

      describe('when making larry 42 via 1 transaction', () => {
        before('make larry age', async () => {
          let tx;

          tx = await larry.age(42, overrides);
          await tx.wait();
        });

        before('send a dummy tx so that the signer nonce is equivalent', async () => {
          const tx = await signer.sendTransaction({
            ...overrides,
            to: signer.address,
            value: 0,
          });
        });

        it('makes larry 42', async () => {
          const years = await larry.yearsLived();

          expect(years.toString()).to.be.equal('42');
        });

        it('gets the state root', async () => {
          stateRootB = await _getStateRoot();
        });

        describe('when comparing the state roots', () => {
          it('shows they are the same', async () => {
            expect(stateRootA).to.be.equal(stateRootB);
          });
        });
      });
    });
  });
});
