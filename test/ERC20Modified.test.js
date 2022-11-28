const {expect} = require('chai');
const {BigNumber} = require('ethers');
const {ethers, upgrades} = require('hardhat');

const GAS_BUFFER = ethers.utils.parseEther('0.01');

describe('ERC20Modified Contract', function() {
  let erc20Modified;
  let deployeraddy;
  let account1;

  beforeEach(async () => {
    [deployer, acc1] = await ethers.getSigners();

    deployeraddy = deployer.address;
    account1 = acc1.address;
    ERC20Modified = await ethers.getContractFactory('ERC20Modified');
    // use the upgradeable pattern
    erc20Modified = await upgrades.deployProxy(ERC20Modified, [1000]);
    await erc20Modified.deployed();
  });

  it('should deploy to an address', async () => {
    expect(await erc20Modified.address).to.not.be.null;
    expect(await erc20Modified.address).to.be.properAddress;
  });

  it('should assign the tokens to the contract', async () => {
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('1000'));
    expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.balanceOf(account1)).to.not.equal(ethers.utils.parseEther('1')); // sanity check
  });

  it('should deploy with other token amounts', async () => {
    ERC20Modified = await ethers.getContractFactory('ERC20Modified');
    erc20Modified = await upgrades.deployProxy(ERC20Modified, [1]);
    await erc20Modified.deployed();

    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1'));

    // Try 0
    erc20Modified = await upgrades.deployProxy(ERC20Modified, [0]);
    await erc20Modified.deployed();

    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('0'));

    // Negative number
    try {
      await expect(upgrades.deployProxy(ERC20Modified, [-2]));
    } catch (err) {
      expect(err.argument).to.equal('initialSupply');
      expect(err.reason).to.equal('value out-of-bounds');
    }
  });
});

describe('Test God Mode', function() {
  let deployer;
  let acc1;

  beforeEach(async () => {
    [deployer, acc1, acc2] = await ethers.getSigners();

    deployeraddy = deployer.address;
    account1 = acc1.address;
    account2 = acc2.address;

    const ERC20Modified = await ethers.getContractFactory('ERC20Modified');
    erc20Modified = await upgrades.deployProxy(ERC20Modified, [1000]);
    await erc20Modified.deployed();
  });

  it('should set the god address correctly', async () => {
    expect(await erc20Modified.owner()).to.equal(deployeraddy);
    expect(await erc20Modified.owner()).to.not.equal(account1);
    expect(await erc20Modified.owner()).to.not.equal(account2);
  });

  it('it should allow the god address to mint new tokens', async () => {
    // Test 1: That total supply increases
    // Test 2: That the address receives the minted tokens
    // Test 3: That others than god cannot
    const before = await erc20Modified.balanceOf(account1);
    expect(before).to.equal(ethers.utils.parseEther('0'));

    const totalSupplybefore = await erc20Modified.totalSupply();
    expect(totalSupplybefore).to.equal(ethers.utils.parseEther('1000'));

    const tx = await erc20Modified.mintTokensToAddress(account1, 1000); // mint 1000 wTokens to account1
    await tx.wait();

    const after = await erc20Modified.balanceOf(account1);
    const totalSupplyafter = await erc20Modified.totalSupply();

    expect(after).to.equal(BigNumber.from('1000'));
    expect(totalSupplyafter).to.equal(BigNumber.from('1000000000000000001000'));

    // make sure account1 cannot mint (non-owner):
    await expect(erc20Modified.connect(acc1).mintTokensToAddress(account1, 1000)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('owner can change any balance at will', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000'));

    let tx = await erc20Modified.changeBalanceAtAddress(account1, 24); // 24 wTokens (NOT Tokens)
    await tx.wait();

    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('24'));
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000024'));

    // But not other accounts
    await expect(erc20Modified.connect(acc1).changeBalanceAtAddress(deployeraddy, 10)).to.be.revertedWith('Ownable: caller is not the owner');

    // changing by nothing should just return:
    tx = await erc20Modified.changeBalanceAtAddress(account1, 0);
    await tx.wait();

    // nothing should happen
    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('24'));
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000024'));
  });

  it('allows the owner to change any balance by a negative amount', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000'));

    // first put some funds in account1:
    let tx = await erc20Modified.changeBalanceAtAddress(account1, 100); // 24 wTokens (NOT Tokens)
    await tx.wait();

    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('100'));
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000100'));

    // now change by <0 amount:
    tx = await erc20Modified.changeBalanceAtAddress(account1, -24); // 24 wTokens (NOT Tokens)
    await tx.wait();

    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('76'));

    // the total supply should also decrease (we burn tokens)
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000076'));
  });

  it('should not change any balance when using byamount=0', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000'));

    // first put some funds in account1:
    let tx = await erc20Modified.changeBalanceAtAddress(account1, 100); // 24 wTokens (NOT Tokens)
    await tx.wait();

    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('100'));
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000100'));

    // now change by ==0 amount:
    tx = await erc20Modified.changeBalanceAtAddress(account1, 0);
    await tx.wait();

    // nothing should have changed
    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('100'));
    expect(await erc20Modified.totalSupply()).to.equal(BigNumber.from('1000000000000000000100'));
  });

  it('should allow owner to transfer from any account to another account', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000'));
    expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(BigNumber.from('0'));

    // deployeraddy does not have any tokens yet
    await expect(erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith('ERC20: transfer amount exceeds balance');

    // now try with tokens
    let tx = await erc20Modified.mintTokensToAddress(deployeraddy, 1e9); // mint 1 gwTokens
    await tx.wait();

    expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(BigNumber.from('1000000000'));

    tx = await erc20Modified.authoritativeTransferFrom(deployeraddy, account2, 24);
    await tx.wait();

    expect(await erc20Modified.balanceOf(account2)).to.equal(BigNumber.from('24'));
    expect(await erc20Modified.balanceOf(deployeraddy)).to.equal(BigNumber.from('1000000000').sub(24));

    // But not other accounts
    await expect(erc20Modified.connect(acc1).authoritativeTransferFrom(deployeraddy, account2, 24)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should ban and unban accounts', async () => {
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
    await expect(erc20Modified.connect(acc1).ban(account2)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(erc20Modified.connect(acc1).unban(account2)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should not allow banning the owner or 0x0', async () => {
    await expect(erc20Modified.ban(deployeraddy)).to.be.revertedWith('Cannot ban owner');
    await expect(erc20Modified.ban(ethers.constants.AddressZero)).to.be.revertedWith('Invalid address');
  });

  it('should not allow unbanning the owner or 0x0', async () => {
    await expect(erc20Modified.unban(deployeraddy)).to.be.revertedWith('Invalid address');
    await expect(erc20Modified.unban(ethers.constants.AddressZero)).to.be.revertedWith('Invalid address');
  });

  it('should allow buying of tokens', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('0'));
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(BigNumber.from('0'));

    // buy 1000 Tokens by sending 1 ether
    await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});

    // now account 1 should have 1000 Tokens
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // and the contract should have 1 ether
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));
  });

  it('should not allow buying 0 tokens', async () => {
    expect(await erc20Modified.balanceOf(account1)).to.equal(BigNumber.from('0'));
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(BigNumber.from('0'));

    // buy 0 tokens...
    await expect(erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('0')})).to.be.revertedWith('Insufficient amount of ether sent!');
  });

  it('should allow the owner to withdraw', async () => {
    // // buy 1000 Tokens by sending 1 ether
    let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
    await tx.wait();

    // and the contract should have 1 ether
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));

    // now we send this 1 ether to the owner
    // but first, non-owner cannot call:
    await expect(erc20Modified.connect(acc1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');

    // get the owner bal before withdraw
    expect(await ethers.provider.getBalance(deployeraddy)).to.be.closeTo(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10'));
    const before = await ethers.provider.getBalance(deployeraddy);

    // now withdraw from the contract to the owner
    tx = await erc20Modified.withdraw();
    await tx.wait();

    // no more ether in the contract
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('0'));

    // the owner has it
    expect(await ethers.provider.getBalance(deployeraddy)).to.be.closeTo(ethers.utils.parseEther('1').add(before), GAS_BUFFER);
    // sanity check
    expect(await ethers.provider.getBalance(deployeraddy)).to.not.be.closeTo(ethers.utils.parseEther('2').add(before), GAS_BUFFER);

    // gas is more than this, so check
    expect(await ethers.provider.getBalance(deployeraddy)).to.not.be.closeTo(ethers.utils.parseEther('2').add(before), ethers.utils.parseEther('0.0000000001'));
  });

  it('should allow a sellback', async () => {
    // buy 1000 Tokens by sending 1 ether
    let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
    await tx.wait();

    // we should have 1000 Tokens
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // and the contract has 0:
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('0'));

    // before we sell from account 1, get amount:
    const before = await ethers.provider.getBalance(account1);
    expect(before).to.be.closeTo(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10'));

    // now sell 500 Tokens
    tx = await erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('500'));
    await tx.wait();

    // we should have 500 now that the user sold back to us
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('500'));

    // account1 receives some ether for the sale
    expect(await ethers.provider.getBalance(account1)).to.be.closeTo(before.add(ethers.utils.parseEther('0.25')), ethers.utils.parseEther('0.001'));
    // ^^ we received 0.25 ether for the sale of 500 Tokens (1000 Tokens is 1 ether)

    // should not allow sellback of 0 amount:
    await expect(erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('0'))).to.be.revertedWith('Nothing given sell back to the contract');
  });

  it('should not allow a sellback where the user has less than what they sell back', async () => {
    // buy some tokens
    const tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
    await tx.wait();

    // we have 1000 tokens now
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // now sell back more than we have
    await expect(erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('10001'))).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });

  it('should mint new tokens if we don\'t hold enough to sell', async () => {
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('1000'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('0'));

    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000'));

    // contract = 1000
    // acc1 = 0
    // first, buy from the supply:
    let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('0.5')}); // 500 tokens
    await tx.wait();

    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('500'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('500'));
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('1000')); // nothing new minted

    // now buy more than we have, we expect a mint
    tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1.5')}); // buy 1500 tokens
    await tx.wait();

    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('500')); // we only mint
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('2000')); // 500 existing + 1500 new
    expect(await erc20Modified.totalSupply()).to.equal(ethers.utils.parseEther('2500')); // nothing new mint
  });

  it('should not sell back ether if we are out of inventory', async () => {
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(BigNumber.from('0'));

    // someone buys some tokens
    let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')}); // buy 1000 tokens
    await tx.wait();

    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // now the owner withdraws all ether
    tx = await erc20Modified.connect(deployer).withdraw();
    await tx.wait();

    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(BigNumber.from('0')); // no eth

    // now a sellback happens - but we are out of funds
    // now sell 500 Tokens back to the contract
    await expect(erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('500'))).to.be.revertedWithCustomError(erc20Modified, 'InsufficientContractFunds');
  });

  it('Should set the right buy price!', async () => {
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(BigNumber.from('0'));

    tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')}); // buy 1000 tokens (at the old price)
    await tx.wait();

    // in this purchase, 1 eth was sent to the contract in return for 1000 Tokens
    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('1'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // now change the price
    tx = await erc20Modified.connect(deployer).setBuyPrice(2000); // double the old price
    await tx.wait();

    // buy with same incoming amount of eth as before -- but we should now get 2000 tokens!
    tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')}); // buy 1000 tokens (at the old price)
    await tx.wait();

    expect(await ethers.provider.getBalance(erc20Modified.address)).to.equal(ethers.utils.parseEther('2'));
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('3000')); // first buy + this one

    // but only the owner can do it
    await expect(erc20Modified.connect(acc1).setBuyPrice(2000)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should allow a sellback', async () => {
    // buy 1000 Tokens by sending 1 ether
    let tx = await erc20Modified.connect(acc1).buy({value: ethers.utils.parseEther('1')});
    await tx.wait();

    // we should have 1000 Tokens
    expect(await erc20Modified.balanceOf(account1)).to.equal(ethers.utils.parseEther('1000'));

    // and the contract has 0:
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('0'));

    // before we sell from account 1, get amount:
    const before = await ethers.provider.getBalance(account1);
    expect(before).to.be.closeTo(ethers.utils.parseEther('10000'), ethers.utils.parseEther('10'));

    // now sell 500 Tokens
    tx = await erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('500'));
    await tx.wait();

    // we should have 500 now that the user sold back to us
    expect(await erc20Modified.balanceOf(erc20Modified.address)).to.equal(ethers.utils.parseEther('500'));

    // account1 receives some ether for the sale
    expect(await ethers.provider.getBalance(account1)).to.be.closeTo(before.add(ethers.utils.parseEther('0.25')), ethers.utils.parseEther('0.001'));
    // ^^ we received 0.25 ether for the sale of 500 Tokens (1000 Tokens is 1 ether)

    // Now change the sellback price/rate:
    tx = await erc20Modified.connect(deployer).setSellPrice(4000);
    await tx.wait();

    // now sell the remaining 500 Tokens, but at the new rate, so we get half as much now
    tx = await erc20Modified.connect(acc1).sellBack(ethers.utils.parseEther('500'));
    await tx.wait();

    // account1 receives some ether for the sale
    // before we made this second sale, the account had 0.25 ether (from the first resale at the old price)
    // now it should have 0.25 + 0.125 (0.125 = 0.25 / 2) = 0.375
    expect(await ethers.provider.getBalance(account1)).to.be.closeTo(before.add(ethers.utils.parseEther('0.375')), ethers.utils.parseEther('0.001'));

    // but only the owner can do it
    await expect(erc20Modified.connect(acc1).setSellPrice(4000)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
