/** @type import('hardhat/config').HardhatUserConfig */
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require('@openzeppelin/hardhat-upgrades'); // to enable upgradeability

module.exports = {
  solidity: "0.8.16",
};
