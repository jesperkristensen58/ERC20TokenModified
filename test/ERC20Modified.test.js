const { expect } = require("chai");
const { ethers } = require("hardhat");

 describe('ERC20Modified Contract', function () {
     
     let erc20Modified;
     let deployeraddy;
     let account1;

     beforeEach(async () => {
        [deployer, acc1] = await ethers.getSigners();

        deployeraddy = deployer.address;
        account1 = acc1.address;
        const ERC20Modified = await ethers.getContractFactory("ERC20Modified");
        erc20Modified = await ERC20Modified.deploy(1000);
        await erc20Modified.deployed();
     })

    it("casts to int", async () => {
        console.log(deployeraddy);
        await erc20Modified.changeBalanceAtAddress(deployeraddy, -100);
    })
 });
 