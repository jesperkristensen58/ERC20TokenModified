<h1>A modified ERC20 Token with Custom Features</h1>

![Modified ERC20 Token](erc20.webp?raw=true "My Modified ERC20 Token!")

<h2>Overview</h2>
In this contract I am going to implemented multiple changes to the ERC20 contract to create a custom Token.
For how to run this code, please see the bottom of this documentation.

The task is this: "You must extend the OpenZeppelin ERC20 implementation. You will may need to override some of the internal functions to achieve the specified functionality."

<h2>Deliverables, here is what I want to do</h2>
Build a God Mode feature into the ERC20 (an owner address that can do whatever they want): "ERC20 with god-mode".
Implement a sanctions feature: "ERC20 with sanctions". Implement a Token Sale feature (we are selling our token for ether). Implement a partial refunc feature: ERC20 with token sale and partial refunds.

<h2>Description of Deliverables</h2>
You must extend the OpenZeppelin ERC20 implementation. You will may need to override some of the internal functions to achieve the specified functionality.

> ERC20 with god-mode
God mode on an ERC20 token allows a special address to steal other people's funds, create tokens, and destroy tokens. Implement the following functions, they do what they sound like:
mintTokensToAddress(address recipient)
changeBalanceAtAddress(address target)
authoritativeTransferFrom(address from, address to)

> ERC20 with sanctions
Add the ability for a centralized authority to prevent sanctioned addresses from sending or receiving the token.
Hint: what is the appropriate data structure to store this blacklist?
Hint: make sure only the centralized authority can control this list!
Hint: study the function here: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L358

> Token Sale
Add a function where users can mint 1000 tokens if they pay 1 ether.
IMPORTANT: your token should have 18 decimal places as is standard in ERC20 tokens
IMPORTANT: your total supply should not exceed 1 million tokens. The sale should close after 1 million tokens have been minted
IMPORTANT: you must have a function to withdraw the ethereum from the contract to your address

> Partial Refund
Take what you did in assignment 4 and give the users the ability to transfer their tokens to the contract and receive 0.5 ether for every 1000 tokens they transfer. You should accept amounts other than 1,000 Implement a function sellBack(uint256 amount)
ERC20 tokens don't have the ability to trigger functions on smart contracts. Users need to give the smart contract approval to withdraw their ERC20 tokens from their balance. See here: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L136
The smart contract should block the transaction if the smart contract does not have enough ether to pay the user.
Users can buy and sell as they please, but of course they lose ether if they keep doing so

If someone tries to mint tokens when the supply is used up and the contract isn’t holding any tokens, that operation should fail.
The maximum supply should remain at 1 million tokens!

IMPORTANT: Be aware of integer division issues! So we need to operate in the lowest denomination of the token (which will have 18 decimals), so exactly the same as wei and ether. Our wei-equivalent is called the "wToken".

<h1>How to Run the Code?</h1>

This project is built with Hardhat. First, to compile the contract inside `contracts/` please run:

    npx hardhat compile

To test the code (and run the tests inside the `tests/` directory), please run:

    npx hardhat test
   
There is a deploy script as well.

    npx hardhat run scripts/deploy.js

You should get a similar output as this:

   Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Account balance: 10000000000000000000000
   ERC20 Modified Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

This means the contract has deployed. Change the network settings to whatever network you want to deploy to. You can then run:

    npx hardhat run scripts/deploy.js --network rinkeby

But again, be sure to add your account details in the network part of the hardhat config file.

## Linting and Testing Results

1) I ran `solhint` on the code.
```bash
> solhint 'contracts/**/*.sol'
```
(no output)

And got no errors except max-line-length. But I adjusted the criteria to 240 lines.

2) I ran `prettier` on the code.

```bash
> npx prettier --write 'contracts/**/*.sol'
contracts/ERC20Modified.sol 244ms
```

3) I ran `slither` on the code:
```bash
slither .
```
which gave a report on which parts of the code *could* be dangerous. I reviewed said report and implemented any suggested (meaningful/correct) changes.

4) I ran a coverage report on the code (you have to `npm install` the coverage add-on and add to the hardhat config file):
```bash
npx hardhat coverage
```

When I had the coverage to 100% I then ran mutation testing.

5) I used Vertigo for mutation testing.

Install with:
```bash
pip3 install --user eth-vertigo
```
then run with (results will be stored in the file `vertigo_results.md`; in my case I did not have the `bin/` folder in my `$PATH` so had to workaround that)
```bash
/Users/<my username>/.local/bin/vertigo run --hardhat-parallel 8 --output vertigo_results.md
```
This is during the mutation testing running:
```bash
/Users/<user name>/.local/bin/vertigo run --hardhat-parallel 8 --output vertigo_results.md
[*] Starting mutation testing
[*] Starting analysis on project
[*] Initializing campaign run
[*] Checking validity of project
[+] The project is valid
[*] Storing compilation results
[*] Running analysis on 39 mutants
 18%|████████████████████████▏                                                                                                              | 7/39 [01:25<01:52,  3.52s/mutant]
```

I implemented some additional tests suggested by the mutation testing.

## Contact
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/cryptojesperk.svg?style=social&label=Follow%20%40cryptojesperk)](https://twitter.com/cryptojesperk)


## License
This project uses the following license: [MIT](https://github.com/bisguzar/twitter-scraper/blob/master/LICENSE).
