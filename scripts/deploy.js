/* eslint-disable require-jsdoc */
const {ethers, upgrades} = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying with a an upgradeable proxy pattern.');

  console.log('============================================================');
  console.log('DEPLOYER:');
  console.log('Deploying contracts with the account: ', deployer.address);
  console.log('Account balance:                      ', (await deployer.getBalance()).toString());
  console.log('============================================================');

  const ERC20Modified = await ethers.getContractFactory('ERC20Modified');
  const instance = await upgrades.deployProxy(ERC20Modified, [1000]); // use the upgradeable pattern
  await instance.deployed();

  /**
   * @dev how to upgrade the implementation contract for a future change in
   * the implementation (called `ERC20Modified_V2`):
   *
   * const ERC20Modified_V2 = await ethers.getContractFactory("ERC20Modified_V2");
   * const upgraded = await upgrades.upgradeProxy(instance.address, ERC20Modified_V2);
   */

  console.log('ERC20 Modified deployed contract address: ', instance.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
