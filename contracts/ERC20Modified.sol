// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// *-- Settings
string constant TOKEN_NAME = "Jesper";
string constant TOKEN_SYMBOL = "JK";
uint256 constant TOTAL_SUPPLY_MAX = 1_000_000;  // no more than this many Tokens will ever exist
uint256 constant wTOKENS_PER_WEI = 1_000;  // Token sales price; how many wTokens you get per 1 Wei spent -- this is the same as the ratio of Tokens per Ether
uint256 constant SELLBACK_RATE_wTOKEN_PER_WEI = 2000;  // the sellback rate. How many wTokens do you need to pay per wei. Also: This is equivalent to how many Tokens you need to sell per 1 Ether in return.
// *-- Errors
error AddressIsBanned(address bannedAddress);
error TotalSupplyBreach(uint256 proposedTotalSupply, uint256 maxSupply);
error TokenSaleFinished();
error InsufficientContractFunds(uint256 contractBalance, uint256 attemptedTransferAmount);

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
        _mint(address(this), initialSupply * (10 ** decimals()));  // count everything in "wTokens" the smallest unit of our Token
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

        if (byAmount < 0)
            _burn(target, uint(-byAmount) * (10 ** decimals()));
        else
            _mint(target, uint(byAmount) * (10 ** decimals()));
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
        
        // First, set the allowance of the "god address" -- aka "owner()" to the amount we want to send
        _approve(from, owner(), amount);

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
    function buy() external payable {
        require(msg.value > 0, "Insufficient amount of ether sent!");

        uint256 wTokensToBuy = wTOKENS_PER_WEI * msg.value;

        // First, do we hold tokens in the contract that we can sell to the buyer?
        // Try this first
        if (balanceOf(address(this)) >= wTokensToBuy) {
            // Just send from what we have in store
            _approve(address(this), msg.sender, wTokensToBuy);
            transferFrom(address(this), msg.sender, wTokensToBuy);
        } else {
            // Mint new tokens and sell those
            _mint(msg.sender, wTokensToBuy); // tx will revert if we exceed the total supply
        }

        // sanity/panic check
        assert(totalSupply() <= TOTAL_SUPPLY_MAX * (10 ** decimals()));
    }

    /**
     * @notice Withdraw funds received from sale of Token from the contract to the owner.
     */
    function withdraw() external payable onlyOwner {
        // transfer the ether in the contract to the owner
        payable(owner()).transfer(address(this).balance);
        assert(address(this).balance == 0);
    }

    /**
     * @notice This function allows users to sell their Token back to the smart contract in exchange for Ether.
     * @param amount the amount of wTokens to sell back to the contract from the caller. Note that 10**18 wTokens = 1 Token.
     */
    function sellBack(uint256 amount) external payable {
        
        // the sender need to approve access to their tokens at the amount they want to transfer
        assert(approve(msg.sender, amount));

        // first transfer their tokens to us
        transferFrom(msg.sender, address(this), amount);  // from, to, amount

        // then send them ETH at the sellback rate
        uint256 weiTransferAmount = amount / SELLBACK_RATE_wTOKEN_PER_WEI;


        if (weiTransferAmount > address(this).balance)
            revert InsufficientContractFunds(address(this).balance, weiTransferAmount);

        if (weiTransferAmount > 0)
            payable(msg.sender).transfer(weiTransferAmount);
    }

    /**
     * @dev Check for banned addresses before performing a token transfer.
     * @param from the address moving tokens from
     * @param to the address moving tokens to
     * @param amount the amount to transfer (if neither from and to are banned)
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
    internal
    override
    virtual
    {
        super._beforeTokenTransfer(from, to, amount); // Call parent hook first

        // Check the sanctioned list
        if (banned[from])
            revert AddressIsBanned(from);
        
        if (banned[to])
            revert AddressIsBanned(to);
    }

    /**
     * @dev Check that the total supply has not been exceeded and that if the total supply is hit, we pause the minting of more tokens.
     * @param from the address to transfer tokens from
     * @param to the address to transfer tokens to
     * @param amount the amount to transfer
     */
    function _afterTokenTransfer(address from, address to, uint256 amount)
    internal
    override
    virtual
    {
        super._afterTokenTransfer(from, to, amount); // Call parent hook first

        // Do not allow minting beyond the total supply cap
        if (totalSupply() > TOTAL_SUPPLY_MAX * (10 ** decimals()))
            revert TotalSupplyBreach(totalSupply(), TOTAL_SUPPLY_MAX * (10 ** decimals()));
        
        if (totalSupply() == TOTAL_SUPPLY_MAX * (10 ** decimals()))
            _pause();  // close the minting of more tokens
    }
}
