// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// *-- Errors
error AddressIsBanned(address bannedAddress);
error TokenSaleFinished();
error InsufficientContractFunds(uint256 contractBalance, uint256 attemptedTransferAmount);

/**
 * @title A modified ERC20 token implementation based on the Openzeppelin standard.
 * @author Jesper Kristensen (@cryptojesperk)
 */
contract ERC20Modified is ERC20, ERC20Capped, Ownable {
    // *---- settings
    string constant TOKEN_NAME = "Jesper";
    string constant TOKEN_SYMBOL = "JK";
    uint256 constant TOTAL_SUPPLY_MAX = 1_000_000;  // no more than this many Tokens will ever exist
    // *---- prices
    uint256 internal wTOKENS_PER_WEI = 1_000;  // Token sales price; how many wTokens you get per 1 Wei spent -- this is the same as the ratio of Tokens per Ether
    uint256 internal SELLBACK_RATE_wTOKEN_PER_WEI = 2_000;  // the sellback rate. How many wTokens do you need to pay per wei. Also: This is equivalent to how many Tokens you need to sell per 1 Ether in return.

    mapping(address => bool) public banned;  // accounts *not* allowed to transfer, buy, or sell

    /**
     * @notice Construct the modified ERC20 token
     * @param initialSupply the initial supply of Tokens (note: *not* wTokens) to mint at the outset
     */
    constructor(uint256 initialSupply) ERC20(TOKEN_NAME, TOKEN_SYMBOL) ERC20Capped(TOTAL_SUPPLY_MAX * (10 ** decimals())) {
        _mint(address(this), initialSupply * (10 ** decimals()));  // count everything in "wTokens" the smallest unit of our Token
    }

    /**
     * @notice Change the price of the token. The price is in Tokens per Ether. 1000 means you get 1000 Tokens per Ether.
     * @dev compare to "setSellPrice"
     * @param newPrice the new price of the token during a buy event (users buying tokens for eth).
     */
    function setBuyPrice(uint newPrice) external onlyOwner {
        wTOKENS_PER_WEI = newPrice;
    }

    /**
     * @notice Change the price of the token in the event of users selling back tokens. The price is in Tokens per Ether. 2000 means you can sell 2000 Tokens for 1 Ether.
     * @dev compare to "setBuyPrice"
     * @param newPrice the new price of the token during a sellBack event (users selling tokens for eth).
     */
    function setSellPrice(uint newPrice) external onlyOwner {
        SELLBACK_RATE_wTOKEN_PER_WEI = newPrice;
    }

    /**
     * @notice Mints "amount" of tokens to "recipient".
     * @dev this minting increases the supply.
     * @param recipient the recipient to mint additional tokens for.
     * @param amount the amount of wTokens to mint (note: *not* Tokens). The overall supply will be increased by this amount.
     */
    function mintTokensToAddress(address recipient, uint256 amount) external onlyOwner {                
        _mint(recipient, amount);  // mint amount of wTokens and send to recipient
    }

    /**
     * @notice Change a balance of the target address by amount.
     * @dev this mints (if the balance is increased) or burns (if the balance is decreased) tokens and changes the supply.
     * @param target the target address to change the balance of.
     * @param byAmount the amount in wTokens to change the balance of the target address by. Note: Does not set the new balance to this amount. It *changes* the balance by this amount.
     */
    function changeBalanceAtAddress(address target, int256 byAmount) external onlyOwner {
        if (byAmount == 0) return;

        if (byAmount < 0)
            _burn(target, uint(-byAmount));
        else
            _mint(target, uint(byAmount));
    }

    /**
     * @notice Transfer an amount "amount" from "from" to "to".
     * @dev this forces the transfer and sets the allowance of "owner" to infinity.
     * @param from the address to transfer from
     * @param to the address to transfer to
     * @param amount the amount of wTokens to transfer from "from" to "to".
     */
    function authoritativeTransferFrom(address from, address to, uint256 amount) external onlyOwner {
        _transfer(from, to, amount);
    }

    /**
     * @notice Bans an address. Adds an address "addr" to the sanctioned list. This means that tokens cannot be transferred to or from this address.
     * @param addr The address to sanction.
     */
    function ban(address addr) external onlyOwner {
        require(addr != msg.sender, "Cannot ban owner");
        require(addr != address(0), "Invalid address");

        banned[addr] = true;
    }

    /**
     * @notice Unbans an address. Removes an address "addr" from the sanctioned list.
     * @param addr The address to remove from the sanctioned list.
     */
    function unban(address addr) external onlyOwner {
        require(addr != msg.sender, "Invalid address");
        require(addr != address(0), "Invalid address");

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
            _transfer(address(this), msg.sender, wTokensToBuy);
        } else {
            // Mint new tokens and sell those
            _mint(msg.sender, wTokensToBuy); // tx will revert if we exceed the total supply
        }
    }

    /**
     * @notice Withdraw funds received from sale of Token from the contract to the owner.
     */
    function withdraw() external onlyOwner {
        // transfer the ether in the contract to the owner
        (bool success,) = msg.sender.call{value: address(this).balance}("");
        require(success, "transfer failed");
    }

    /**
     * @notice This function allows users to sell their Token back to the smart contract in exchange for Ether.
     * @dev if the contract cannot pay the caller an error is raised
     * @param amount the amount of wTokens to sell back to the contract from the caller. Note that 10**18 wTokens = 1 Token.
     */
    function sellBack(uint256 amount) external {
        // first transfer their tokens to us
        transfer(address(this), amount);

        // then send them ETH at the sellback rate
        uint256 weiTransferAmount = amount / SELLBACK_RATE_wTOKEN_PER_WEI;

        if (weiTransferAmount > 0) {
            // can we afford to pay them for the tokens?
            if (weiTransferAmount > address(this).balance)
                revert InsufficientContractFunds(address(this).balance, weiTransferAmount);

            (bool success,) = msg.sender.call{value: weiTransferAmount}("");
            require(success, "transfer failed!");
        }
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
        // Check the sanctioned list
        if (banned[from])
            revert AddressIsBanned(from);
        
        if (banned[to])
            revert AddressIsBanned(to);
        
        super._beforeTokenTransfer(from, to, amount);  // reverts are before the hook
    }

    /**
     * @dev we override the _mint function in ERC20 and ERC20Capped.
     * @param account the account to mint tokens to.
     * @param amount the amount of tokens to mint.
     */
    function _mint(address account, uint256 amount) internal virtual override(ERC20, ERC20Capped) {
        super._mint(account, amount);
    }
}
