const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('larry', function() {
  let larry;
  let snapshotId;
  let stateRootA, stateRootB;

  async function getStateRoot() {
    const blockNumberHex = `0x${await ethers.provider.getBlockNumber()}`;

    // Getting a block at a lower level, directly via the json-rpc provides more data.
    const result = await ethers.provider.send('eth_getBlockByNumber', [blockNumberHex, false]);

    return result.stateRoot;
  }

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

      tx = await larry.age(20);
      await tx.wait();

      tx = await larry.age(22);
      await tx.wait();
    });

    after('get state root', async () => {
      stateRootA = await getStateRoot();
    });

    it('makes larry 42', async () => {
      const years = await larry.yearsLived();

      expect(years.toString()).to.be.equal('42');
    });

    describe('when rewinding', () => {
      before('restore the snapshot', async () => {
        await ethers.provider.send('evm_revert', [snapshotId]);
      });

      it('shows that larry is 0', async () => {
        const years = await larry.yearsLived();

        expect(years.toString()).to.be.equal('0');
      });

      describe('when making larry 42 via 1 transaction', () => {
        before('make larry age', async () => {
          let tx;

          tx = await larry.age(42);
          await tx.wait();
        });

        after('get state root', async () => {
          stateRootB = await getStateRoot();
        });

        it('makes larry 42', async () => {
          const years = await larry.yearsLived();

          expect(years.toString()).to.be.equal('42');
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
