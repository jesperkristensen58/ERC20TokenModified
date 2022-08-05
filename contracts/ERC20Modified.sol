// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

string constant TOKEN_NAME = "Jesper";
string constant TOKEN_SYMBOL = "JK";

/**
 * @title A modified ERC20 token implementation based on the Openzeppelin standard.
 * @author Jesper Kristensen (@cryptojesperk)
 */
contract ERC20Modified is ERC20, Ownable {

    /**
     * @notice Construct the modified ERC20 token
     * @param initialSupply the initial supply to mint at the outset
     */
    constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        _mint(msg.sender, initialSupply);
    }

    // function _beforeTokenTransfer(address from, address to, uint256 amount)
    // internal virtual
    // {
    //     super._beforeTokenTransfer(from, to, amount); // Call parent hook

    //     console.log("from: %s, to: %s", from, to)
    //     console.logUint(amount);
    // }

    /**
     * @notice Mints "amount" of tokens to "recipient".
     * @dev this minting increases the supply.
     * @param recipient the recipient to mint additional tokens for.
     * @param amount the amount of tokens to mint. The overall supply will be increased by this amount.
     */
    function mintTokensToAddress(address recipient, uint256 amount) external onlyOwner {                
        _mint(recipient, amount);  // mint amount tokens and send to recipient
    }

    /**
     * @notice Change a balance of the target address by amount.
     * @dev this mints (if the balance is increased) or burns (if the balance is decreased) tokens and changes the supply.
     * @param target the target address to change the balance of.
     * @param byAmount the amount to change the balance of the target address by. Note: Does not set the new balance to this amount. It *changes* the balance by this amount.
     */
    function changeBalanceAtAddress(address target, int256 byAmount) external onlyOwner {
        if (byAmount == 0) return;

        if (byAmount < 0) {
            _burn(target, uint(-byAmount));
        } else {
            _mint(target, uint(byAmount));
        }
    }

    /**
     * @notice Transfer an amount "amount" from "from" to "to".
     * @dev this forces the transfer and sets the allowance of "owner" to infinity.
     * @param from the address to transfer from
     * @param to the address to transfer to
     * @param amount the amount to transfer from "from" to "to".
     */
    function authoritativeTransferFrom(address from, address to, uint256 amount) external onlyOwner {
        require(balanceOf(from) >= amount, "Insufficient balance of from!");
        
        // First, set the allowance of the "god address" -- aka "owner()" -- to infinity: we can move whatever amount we want
        _approve(from, owner(), type(uint256).max);

        // Then transfer from "from" to "to" an amount "amount"
        // the caller is owner() so the allowance is infinity and we can move the tokens
        transferFrom(from, to, amount);
    }
}
