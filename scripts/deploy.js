async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ERC20Modified = await ethers.getContractFactory("ERC20Modified");
  const erc20Modified = await ERC20Modified.deploy(1000);

  console.log("ERC20 Modified Contract address:", erc20Modified.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
