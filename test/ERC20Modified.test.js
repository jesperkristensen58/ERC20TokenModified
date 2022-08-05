const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('ERC20Modified Contract', function () {
    
    let erc20Modified;
    let deployeraddy;
    let account1;
    let account2;

    beforeEach(async () => {
        [deployer, acc1] = await ethers.getSigners();

        deployeraddy = deployer.address;
        account1 = acc1.address;
        ERC20Modified = await ethers.getContractFactory("ERC20Modified");
        erc20Modified = await ERC20Modified.deploy(1000);
        await erc20Modified.deployed();
    })

    it("should deploy to an address", async () => {
        expect(await erc20Modified.address).to.not.be.null;
    })

    it("should assign the tokens to the contract", async () => {
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(erc20Modified.address))).to.equal("1000.0");
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(deployeraddy))).to.equal("0.0");
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(account1))).to.equal("0.0");
    })
});

describe("Test God Mode", function () {

    beforeEach(async () => {
        [deployer, acc1, acc2] = await ethers.getSigners();

        deployeraddy = deployer.address;
        account1 = acc1.address;
        account2 = acc2.address;

        const ERC20Modified = await ethers.getContractFactory("ERC20Modified");
        erc20Modified = await ERC20Modified.deploy(1000);
        await erc20Modified.deployed();
    })

    it("should set the god address correctly", async () => {
        expect(await erc20Modified.owner()).to.equal(deployeraddy);
        expect(await erc20Modified.owner()).to.not.equal(account1);
        expect(await erc20Modified.owner()).to.not.equal(account2);
    });

    it("should allocate")
});
