// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

string constant TOKEN_NAME = "Jesper";
string constant TOKEN_SYMBOL = "JK";
uint256 constant TOTAL_SUPPLY_MAX = 1_000_000;  // no more than this many Tokens will ever exist
uint256 constant wTOKENS_PER_WEI = 1_000;  // how many wTokens you get per 1 Wei spent -- this is the same as the ratio of Tokens per Ether
// *-- Errors
error AddressIsBanned(address bannedAddress);
error TotalSupplyBreach(uint256 proposedTotalSupply, uint256 maxSupply);
error TokenSaleFinished();

/**
 * @title A modified ERC20 token implementation based on the Openzeppelin standard.
 * @author Jesper Kristensen (@cryptojesperk)
 */
contract ERC20Modified is ERC20, Ownable, Pausable {
    mapping(address => bool) banned;

    /**
     * @notice Construct the modified ERC20 token
     * @param initialSupply the initial supply to mint at the outset
     */
    constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        _mint(msg.sender, initialSupply * (10 ** decimals()));  // count everything in "wTokens" the smallest unit of our Token
    }

    /**
     * @notice Mints "amount" of tokens to "recipient".
     * @dev this minting increases the supply.
     * @param recipient the recipient to mint additional tokens for.
     * @param amount the amount of tokens to mint. The overall supply will be increased by this amount.
     */
    function mintTokensToAddress(address recipient, uint256 amount) external onlyOwner {                
        _mint(recipient, amount * (10 ** decimals()));  // mint amount tokens and send to recipient
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
            _burn(target, uint(-byAmount) * (10 ** decimals()));
        } else {
            _mint(target, uint(byAmount) * (10 ** decimals()));
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
        require(balanceOf(from) >= (amount * (10 ** decimals())), "Insufficient balance of from!");
        
        // First, set the allowance of the "god address" -- aka "owner()" -- to infinity: we can move whatever amount we want
        _approve(from, owner(), type(uint256).max);

        // Then transfer from "from" to "to" an amount "amount"
        // the caller is owner() so the allowance is infinity and we can move the tokens
        transferFrom(from, to, amount * (10 ** decimals()));
    }

    /**
     * @notice Bans an address. Adds an address "addr" to the sanctioned list. This means that tokens cannot be transferred to or from this address.
     * @param addr The address to sanction.
     */
    function ban(address addr) external onlyOwner {
        banned[addr] = true;
    }

    /**
     * @notice Unbans an address. Removes an address "addr" from the sanctioned list.
     * @param addr The address to remove from the sanctioned list.
     */
    function unban(address addr) external onlyOwner {
        banned[addr] = false;
    }

    /**
     * @notice Buy tokens with eth.
     * @dev tokens are minted and sent to the buyer. If we exceed the max supply, an error is thrown.
     */
    function buy() external payable whenNotPaused {
        require(msg.value > 0, "Insufficient amount of ether sent!");

        _mint(msg.sender, wTOKENS_PER_WEI * msg.value);
        assert(totalSupply() <= TOTAL_SUPPLY_MAX * (10 ** decimals()));
    }

    function withdraw() external payable onlyOwner {
        // transfer the ether in the contract to the owner
        payable(owner()).transfer(address(this).balance);
        assert(address(this).balance == 0);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override virtual
    {
        super._beforeTokenTransfer(from, to, amount); // Call parent hook first

        // Check the sanctioned list
        if (banned[from])
            revert AddressIsBanned(from);
        
        if (banned[to])
            revert AddressIsBanned(to);
    }

    function _afterTokenTransfer(address, address, uint256) internal override virtual
    {
        // Do not allow minting beyond the total supply cap
        if (totalSupply() > TOTAL_SUPPLY_MAX * (10 ** decimals()))
            revert TotalSupplyBreach(totalSupply(), TOTAL_SUPPLY_MAX * (10 ** decimals()));
        
        if (totalSupply() == TOTAL_SUPPLY_MAX * (10 ** decimals()))
            pause();  // close the sale of Token
    }
}
