A modified ERC20 Token! Based on the OpenZeppelin Standard.

We are going to implemented multiple changes to the ERC20 contract to create a custom Token.

You must extend the OpenZeppelin ERC20 implementation. You will may need to override some of the internal functions to achieve the specified functionality.

1) ERC20 with God Mode!
ERC20 with god-mode
God mode on an ERC20 token allows a special address to steal other people's funds, create tokens, and destroy tokens. Implement the following functions, they do what they sound like:

```
    mintTokensToAddress(address recipient)
    changeBalanceAtAddress(address target)
    authoritativeTransferFrom(address from, address to)
  ```
