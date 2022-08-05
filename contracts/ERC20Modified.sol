// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// 0x5FbDB2315678afecb367f032d93F642f64180aa3
contract ERC20Modified is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("Jesper", "JTK") {
        _mint(msg.sender, initialSupply);
    }

    function mintTokensToAddress(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);  // mint amount tokens and send to recipient
    }

    function changeBalanceAtAddress(address target, int256 amount) external {
        if (amount == 0) return;

        if (amount < 0) {
            _burn(target, uint(-amount));
        } else {
            _mint(target, uint(amount));
        }
    }

    function authoritativeTransferFrom(address from, address to) external onlyOwner {

    }
}
