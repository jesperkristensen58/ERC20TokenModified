Mutation testing report:
Number of mutations:    39
Killed:                 25 / 39

Mutations:
Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 55
    Result: Killed
    Original line:
                 if (byAmount == 0) return;

    Mutated line:
                 if (byAmount != 0) return;


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 57
    Result: Lived
    Original line:
                 if (byAmount < 0) _burn(target, uint256(-byAmount));

    Mutated line:
                 if (byAmount <= 0) _burn(target, uint256(-byAmount));


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 82
    Result: Killed
    Original line:
                 require(msg.value > 0, "Insufficient amount of ether sent!");

    Mutated line:
                 require(msg.value >= 0, "Insufficient amount of ether sent!");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 99
    Result: Lived
    Original line:
                 require(amount > 0, "Nothing given sell back to the contract");

    Mutated line:
                 require(amount >= 0, "Nothing given sell back to the contract");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 105
    Result: Lived
    Original line:
                 if (weiTransferAmount > address(this).balance)

    Mutated line:
                 if (weiTransferAmount >= address(this).balance)


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 55
    Result: Killed
    Original line:
                 if (byAmount == 0) return;

    Mutated line:
                 if (byAmount != 0) return;


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 57
    Result: Killed
    Original line:
                 if (byAmount < 0) _burn(target, uint256(-byAmount));

    Mutated line:
                 if (byAmount >= 0) _burn(target, uint256(-byAmount));


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 68
    Result: Killed
    Original line:
                 require(addr != msg.sender, "Cannot ban owner");

    Mutated line:
                 require(addr == msg.sender, "Cannot ban owner");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 69
    Result: Killed
    Original line:
                 require(addr != address(0), "Invalid address");

    Mutated line:
                 require(addr == address(0), "Invalid address");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 75
    Result: Killed
    Original line:
                 require(addr != msg.sender, "Invalid address");

    Mutated line:
                 require(addr == msg.sender, "Invalid address");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 76
    Result: Killed
    Original line:
                 require(addr != address(0), "Invalid address");

    Mutated line:
                 require(addr == address(0), "Invalid address");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 82
    Result: Killed
    Original line:
                 require(msg.value > 0, "Insufficient amount of ether sent!");

    Mutated line:
                 require(msg.value <= 0, "Insufficient amount of ether sent!");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 85
    Result: Killed
    Original line:
                 if (balanceOf(address(this)) >= wTokensToBuy) {

    Mutated line:
                 if (balanceOf(address(this)) < wTokensToBuy) {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 99
    Result: Error
    Original line:
                 require(amount > 0, "Nothing given sell back to the contract");

    Mutated line:
                 require(amount <= 0, "Nothing given sell back to the contract");


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 105
    Result: Error
    Original line:
                 if (weiTransferAmount > address(this).balance)

    Mutated line:
                 if (weiTransferAmount <= address(this).balance)


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 29
    Result: Killed
    Original line:
                 _mint(address(this), initialSupply * (10**decimals()));

    Mutated line:
                 _mint(address(this), initialSupply / (10**decimals()));


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 27
    Result: Killed
    Original line:
                 ERC20Capped(TOTAL_SUPPLY_MAX * (10**decimals()))

    Mutated line:
                 ERC20Capped(TOTAL_SUPPLY_MAX / (10**decimals()))


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 83
    Result: Killed
    Original line:
                 uint256 wTokensToBuy = wTokensPerWei * msg.value;

    Mutated line:
                 uint256 wTokensToBuy = wTokensPerWei / msg.value;


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 103
    Result: Error
    Original line:
                 uint256 weiTransferAmount = amount / sellbackRatewTokenPerWei;

    Mutated line:
                 uint256 weiTransferAmount = amount * sellbackRatewTokenPerWei;


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 29
    Result: Killed
    Original line:
                 _mint(address(this), initialSupply * (10**decimals()));

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 48
    Result: Killed
    Original line:
                 _mint(recipient, amount);

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 58
    Result: Equivalent
    Original line:
                 else _mint(target, uint256(byAmount));

    Mutated line:
                 else 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 57
    Result: Equivalent
    Original line:
                 if (byAmount < 0) _burn(target, uint256(-byAmount));

    Mutated line:
                 if (byAmount < 0) 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 65
    Result: Killed
    Original line:
                 _transfer(from, to, amount);

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 88
    Result: Killed
    Original line:
                     _mint(msg.sender, wTokensToBuy);

    Mutated line:
                     


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 86
    Result: Killed
    Original line:
                     _transfer(address(this), msg.sender, wTokensToBuy);

    Mutated line:
                     


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 106
    Result: Equivalent
    Original line:
                     revert InsufficientContractFunds(

    Mutated line:
                     revert 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 121
    Result: Equivalent
    Original line:
                 if (banned[from]) revert AddressIsBanned(from);

    Mutated line:
                 if (banned[from]) revert 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 122
    Result: Equivalent
    Original line:
                 if (banned[to]) revert AddressIsBanned(to);

    Mutated line:
                 if (banned[to]) revert 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 26
    Result: Equivalent
    Original line:
                 ERC20(TOKEN_NAME, TOKEN_SYMBOL)

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 27
    Result: Equivalent
    Original line:
                 ERC20Capped(TOTAL_SUPPLY_MAX * (10**decimals()))

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 32
    Result: Killed
    Original line:
             function setBuyPrice(uint256 newPrice) external onlyOwner {

    Mutated line:
             function setBuyPrice(uint256 newPrice) external  {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 38
    Result: Lived
    Original line:
             function setSellPrice(uint256 newPrice) external onlyOwner {

    Mutated line:
             function setSellPrice(uint256 newPrice) external  {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 46
    Result: Killed
    Original line:
                 onlyOwner

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 53
    Result: Killed
    Original line:
                 onlyOwner

    Mutated line:
                 


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 64
    Result: Killed
    Original line:
             ) external onlyOwner {

    Mutated line:
             ) external  {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 67
    Result: Killed
    Original line:
             function ban(address addr) external onlyOwner {

    Mutated line:
             function ban(address addr) external  {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 74
    Result: Killed
    Original line:
             function unban(address addr) external onlyOwner {

    Mutated line:
             function unban(address addr) external  {


Mutation:
    File: /Users/jesperkristensen/Dropbox/PycharmProjects/ERC20TokenModified/contracts/ERC20Modified.sol
    Line nr: 92
    Result: Killed
    Original line:
             function withdraw() external onlyOwner {

    Mutated line:
             function withdraw() external  {


