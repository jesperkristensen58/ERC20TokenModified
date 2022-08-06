A modified ERC20 Token! Based on the OpenZeppelin Standard.

We are going to implemented multiple changes to the ERC20 contract to create a custom Token.

The task is this:
You must extend the OpenZeppelin ERC20 implementation. You will may need to override some of the internal functions to achieve the specified functionality.

*Deliverables*
    ERC20 with god-mode
    ERC20 with sanctions
    ERC20 with token sale
    ERC20 with token sale and partial refunds

*Description of Deliverables*
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

If someone tries to mint tokens when the supply is used up and the contract isn’t holding any tokens, that operation should fail. The maximum supply should remain at 1 million
IMPORTANT: Be aware of integer division issues!
