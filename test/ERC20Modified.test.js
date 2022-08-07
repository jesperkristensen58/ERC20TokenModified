const { expect } = require("chai");
const { BigNumber } = require("ethers");
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
        expect(await erc20Modified.address).to.be.properAddress;
    })

    it("should assign the tokens to the contract", async () => {
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(erc20Modified.address))).to.equal("1000.0");
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(deployeraddy))).to.equal("0.0");
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(account1))).to.equal("0.0");
    })

    it("should deploy with other token amounts", async () => {
        ERC20Modified = await ethers.getContractFactory("ERC20Modified");
        erc20Modified = await ERC20Modified.deploy(1);
        await erc20Modified.deployed();

        let totalSupplybefore = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplybefore).to.equal("1.0");

        // Try 0
        erc20Modified = await ERC20Modified.deploy(0);
        await erc20Modified.deployed();

        totalSupplybefore = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplybefore).to.equal("0.0");

        // Negative number
        await expect(ERC20Modified.deploy(-2)).to.be.reverted;
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
        const before = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(before).to.equal("0.0");

        const totalSupplybefore = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplybefore).to.equal("1000.0");

        await erc20Modified.mintTokensToAddress(account1, 1000);  // mint 1000 Tokens
        const after = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));

        const totalSupplyafter = ethers.utils.formatEther(await erc20Modified.totalSupply());

        expect(after).to.equal("0.000000000000001");
        expect(totalSupplyafter).to.equal("1000.000000000000001");

        // make sure account1 cannot mint (non-owner):
        await expect(erc20Modified.connect(acc1).mintTokensToAddress(account1, 1000)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can change any balance at will", async () => {
        const before = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(before).to.equal("0.0");

        const totalSupplybefore = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplybefore).to.equal("1000.0");

        await erc20Modified.changeBalanceAtAddress(account1, 24);  // 24 wTokens (NOT Tokens)
        const after = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(after).to.equal("0.000000000000000024");

        const totalSupplyafter = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplyafter).to.equal("1000.000000000000000024");

        // But not other accounts
        await expect(erc20Modified.connect(acc1).changeBalanceAtAddress(deployeraddy, 10)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow owner to transfer from any account to another account", async () => {
        let before = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(before).to.equal("0.0");

        let totalSupplybefore = ethers.utils.formatEther(await erc20Modified.totalSupply());
        expect(totalSupplybefore).to.equal("1000.0");

        await expect(ethers.utils.formatEther(await erc20Modified.balanceOf(deployeraddy))).to.equal("0.0");

        // deployeraddy does not have any tokens yet
        await expect(erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        
        // now try with tokens
        await erc20Modified.mintTokensToAddress(deployeraddy, 1e9);  // mint 1 gwTokens
        await expect(ethers.utils.formatEther(await erc20Modified.balanceOf(deployeraddy))).to.equal("0.000000001");

        await erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24);

        before = await ethers.utils.formatEther(await erc20Modified.balanceOf(account2));
        expect(before).to.equal("0.000000000000000024");
        before = await ethers.utils.formatEther(await erc20Modified.balanceOf(deployeraddy));
        expect(before).to.equal("0.000000000999999976");

        // But not other accounts
        await expect(erc20Modified.connect(acc1).authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should ban and unban accounts", async () => {
        // before ban, all is fine
        await erc20Modified.mintTokensToAddress(account1, 1000);

        // now ban
        await erc20Modified.ban(account1);

        // after ban: now tokens can't be minted to account1
        await expect(erc20Modified.mintTokensToAddress(account1, 1000)).to.be.reverted;
        // or transferred
        await expect(erc20Modified.authoritativeTransferFrom(account1, deployeraddy, 100)).to.be.reverted;

        // now unban
        await erc20Modified.unban(account1);

        // now fine again
        await erc20Modified.mintTokensToAddress(account1, 1000);
        await erc20Modified.authoritativeTransferFrom(account1, deployeraddy, 100);

        // but only owner can ban
        await expect(erc20Modified.connect(acc1).ban(account2)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(erc20Modified.connect(acc1).unban(account2)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow buying of tokens", async () => {
        const before = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(before).to.equal("0.0");

        const beforeether = ethers.utils.formatEther(await ethers.provider.getBalance(erc20Modified.address));
        expect(beforeether).to.equal("0.0");

        // buy 1000 Tokens by sending 1 ether
        await erc20Modified.connect(acc1).buy({value: ethers.utils.parseUnits('1', 18)});

        // now account 1 should have 1000 Tokens
        const after = ethers.utils.formatEther(await erc20Modified.balanceOf(account1));
        expect(after).to.equal("1000.0");

        // and the contract should have 1 ether
        const afterefther = ethers.utils.formatEther(await ethers.provider.getBalance(erc20Modified.address));
        expect(afterefther).to.equal("1.0");
    });

    it("should allow the owner to withdraw", async () => {
        // buy 1000 Tokens by sending 1 ether
        await erc20Modified.connect(acc1).buy({value: ethers.utils.parseUnits('1', 'ether')});

        // and the contract should have 1 ether
        let afterefther = ethers.utils.formatEther(await ethers.provider.getBalance(erc20Modified.address));
        expect(afterefther).to.equal("1.0");

        // now we send this 1 ether to the owner
        // but first, non-owner cannot call:
        await expect(erc20Modified.connect(acc1).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");

        // get the owner bal before withdraw
        let beforedeployer = ethers.utils.formatEther(await ethers.provider.getBalance(deployeraddy));
        expect(beforedeployer).to.equal("9999.958848192139409562");

        // now withdraw from the contract to the owner
        await erc20Modified.withdraw();

        // no more ether in the contract
        afterefther = ethers.utils.formatEther(await ethers.provider.getBalance(erc20Modified.address));
        expect(afterefther).to.equal("0.0");

        // the owner has it
        afterefther = ethers.utils.formatEther(await ethers.provider.getBalance(deployeraddy));

        // received 1 ether
        expect(afterefther).to.equal("10000.958817105945067592");
    });

    it("should allow a sellback", async () => {
        // buy 1000 Tokens by sending 1 ether
        await erc20Modified.connect(acc1).buy({value: ethers.utils.parseUnits('1', 'ether')});

        // we should have 1000 Tokens
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(account1))).to.equal("1000.0");

        // and the contract has 0:
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(erc20Modified.address))).to.equal("0.0");

        // before we sell, get amount:
        let amnt = ethers.utils.formatEther(await ethers.provider.getBalance(account1));
        expect(amnt).to.equal("9996.999622535959975422");

        // now sell 500 Tokens
        await erc20Modified.connect(acc1).sellBack(ethers.utils.parseUnits('500', 'ether'));
        
        // we should only have 500 now
        expect(ethers.utils.formatEther(await erc20Modified.balanceOf(erc20Modified.address))).to.equal("500.0");

        // but we sold back ether, so we should have received some ether
        amnt = ethers.utils.formatEther(await ethers.provider.getBalance(account1));
        expect(amnt).to.equal("9997.249547465644581412");
        // ^^ we received 0.25 ether for the sale of 500 Tokens (1000 Tokens is 1 ether)
    });

    it("should not allow to buy more tokens than what we have", async () => {
        await expect(erc20Modified.connect(acc1).buy({value: ethers.utils.parseUnits('1000', 'ether')})).to.be.revertedWith(
            "ERC20Capped: cap exceeded"
        );
    });
});