// @TODO: Modify tests to compare relative numbers
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const GAS_BUFFER = ethers.utils.parseEther("0.01");

describe('ERC20Modified Contract', function () {
    
    let erc20Modified;
    let deployeraddy;
    let account1;
    
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
        expect(await erc20Modified.address).to.be.properAddress;
    })

    it("should assign the tokens to the contract", async () => {
        expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther("1000"));
        expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(ethers.utils.parseEther("0"));
        expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther("0"));
        expect(await erc20Modified.balanceOf(account1)).to.not.equal(ethers.utils.parseEther("1"));  // sanity check
    })

    it("should deploy with other token amounts", async () => {
        ERC20Modified = await ethers.getContractFactory("ERC20Modified");
        erc20Modified = await ERC20Modified.deploy(1);
        await erc20Modified.deployed();

        expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther("1"));

        // Try 0
        erc20Modified = await ERC20Modified.deploy(0);
        await erc20Modified.deployed();

        expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther("0"));

        // Negative number
        try {
            await expect(ERC20Modified.deploy(-2)).to.be.revertedWith("Error: value out-of-bounds");
        } catch (err) {
            expect(err.argument).to.equal("initialSupply");
            expect(err.reason).to.equal("value out-of-bounds");    
        }
    });
});

describe("Test God Mode", function () {

    let deployer;
    let acc1;

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

    it("it should allow the god address to mint new tokens", async () => {
        // Test 1: That total supply increases
        // Test 2: That the address receives the minted tokens
        // Test 3: That others than god cannot
        const before = await erc20Modified.balanceOf(account1);
        expect(before).to.equal(ethers.utils.parseEther("0"));

        const totalSupplybefore = await erc20Modified.totalSupply();
        expect(totalSupplybefore).to.equal(ethers.utils.parseEther("1000"));

        const tx = await erc20Modified.mintTokensToAddress(account1, 1000);  // mint 1000 wTokens to account1
        await tx.wait();

        const after = await erc20Modified.balanceOf(account1);
        const totalSupplyafter = await erc20Modified.totalSupply();

        expect(after).to.equal(new BigNumber.from("1000"));
        expect(totalSupplyafter).to.equal(new BigNumber.from("1000000000000000001000"));

        // make sure account1 cannot mint (non-owner):
        await expect(erc20Modified.connect(acc1).mintTokensToAddress(account1, 1000)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can change any balance at will", async () => {
        
        expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther("0"));
        expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther("1000"));

        const tx = await erc20Modified.changeBalanceAtAddress(account1, 24);  // 24 wTokens (NOT Tokens)
        await tx.wait();

        expect(await erc20Modified.balanceOf(account1)).to.equal(new BigNumber.from("24"));
        expect(await erc20Modified.totalSupply()).to.equal(new BigNumber.from("1000000000000000000024"));

        // But not other accounts
        await expect(erc20Modified.connect(acc1).changeBalanceAtAddress(deployeraddy, 10)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow owner to transfer from any account to another account", async () => {

        expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther("0"));
        expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther("1000"));
        expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(new BigNumber.from("0"));

        // deployeraddy does not have any tokens yet
        await expect(erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        
        // now try with tokens
        let tx = await erc20Modified.mintTokensToAddress(deployeraddy, 1e9);  // mint 1 gwTokens
        await tx.wait();

        expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(new BigNumber.from("1000000000"));

        tx = await erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24);
        await tx.wait();

        expect(await erc20Modified.balanceOf(account2)).to.equal(new BigNumber.from("24"));
        expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(new BigNumber.from("1000000000") - new BigNumber.from("24"));

        // But not other accounts
        await expect(erc20Modified.connect(acc1).authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should ban and unban accounts", async () => {
        // before ban, all is fine
        let tx = await erc20Modified.mintTokensToAddress(account1, 1000);
        await tx.wait();

        // now ban
        tx = await erc20Modified.ban(account1);
        await tx.wait();

        // after ban: now tokens can't be minted to account1
        await expect(erc20Modified.mintTokensToAddress(account1, 1000)).to.be.reverted;
        // or transferred
        await expect(erc20Modified.authoritativeTransferFrom(account1, deployeraddy, 100)).to.be.reverted;

        // now unban
        tx = await erc20Modified.unban(account1);
        await tx.wait();

        // now it should be fine again
        tx = await erc20Modified.mintTokensToAddress(account1, 1000);
        await tx.wait();

        tx = await erc20Modified.authoritativeTransferFrom(account1, deployeraddy, 100);
        await tx.wait();

        // but only owner can ban
        await expect(erc20Modified.connect(acc1).ban(account2)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(erc20Modified.connect(acc1).unban(account2)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow buying of tokens", async () => {

        expect(await erc20Modified.balanceOf(account1)).to.equal(new BigNumber.from("0"));
        expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(new BigNumber.from("0"));

        // buy 1000 Tokens by sending 1 ether
        await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});

        // now account 1 should have 1000 Tokens
        expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

        // and the contract should have 1 ether
        expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));
    });

    it("should allow the owner to withdraw", async () => {
        // // buy 1000 Tokens by sending 1 ether
        let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
        await tx.wait();

        // and the contract should have 1 ether
        expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));

        // now we send this 1 ether to the owner
        // but first, non-owner cannot call:
        await expect(erc20Modified.connect(acc1).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");

        // get the owner bal before withdraw
        expect(await ethers.provider.getBalance(deployeraddy)).to.be.closeTo(ethers.utils.parseEther("10000"), ethers.utils.parseEther("10"));
        let before = await ethers.provider.getBalance(deployeraddy);

        // now withdraw from the contract to the owner
        tx = await erc20Modified.withdraw();
        await tx.wait();

        // no more ether in the contract
        expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther("0"));

        // the owner has it
        expect(await ethers.provider.getBalance(deployeraddy)).to.be.closeTo(ethers.utils.parseEther("1").add(before), GAS_BUFFER);
        // sanity check
        expect(await ethers.provider.getBalance(deployeraddy)).to.not.be.closeTo(ethers.utils.parseEther("2").add(before), GAS_BUFFER);

        // gas is more than this, so check
        expect(await ethers.provider.getBalance(deployeraddy)).to.not.be.closeTo(ethers.utils.parseEther("2").add(before), ethers.utils.parseEther("0.0000000001"));
    });

    it("should allow a sellback", async () => {
        // buy 1000 Tokens by sending 1 ether
        let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
        await tx.wait();

        // we should have 1000 Tokens
        expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

        // and the contract has 0:
        expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('0'));

        // before we sell from account 1, get amount:
        let before = await ethers.provider.getBalance(account1);
        expect(before).to.be.closeTo(ethers.utils.parseEther("10000"), ethers.utils.parseEther("10"));

        // now sell 500 Tokens
        tx = await erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('500'));
        await tx.wait();
        
        // we should have 500 now that the user sold back to us
        expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther("500"));

        // account1 receives some ether for the sale
        expect(await ethers.provider.getBalance(account1)).to.be.closeTo(before.add(ethers.utils.parseEther("0.25")), ethers.utils.parseEther("0.001"));
        // ^^ we received 0.25 ether for the sale of 500 Tokens (1000 Tokens is 1 ether)
    });

    it("should not allow to buy more tokens than what we have", async () => {
        await expect(erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1000')})).to.be.revertedWith(
            "ERC20Capped: cap exceeded"
        );
    });
});