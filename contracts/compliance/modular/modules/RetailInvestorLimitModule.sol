// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import './AbstractModule.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title RetailInvestorLimitModule
 * @dev Custom compliance module for limiting retail investor transaction amounts.
 * Demonstrates the ability to build custom compliance logic on top of ERC-3643.
 * - Forces a maximum transaction limit per transfer for specific regulatory guidelines.
 */
contract RetailInvestorLimitModule is AbstractModule, Ownable {
    // Maximum allowed token amount per transaction for retail investors
    uint256 public maxRetailTxAmount;

    constructor(uint256 _initialLimit) {
        maxRetailTxAmount = _initialLimit;
    }

    /**
     * @dev Allows the issuer or admin to dynamically update the limit based on regulation changes.
     */
    function setMaxRetailTxAmount(uint256 _newLimit) external onlyOwner {
        maxRetailTxAmount = _newLimit;
    }

    // AbstractModule standard overrides
    function moduleTransferAction(address, address, uint256) external override {}
    function moduleMintAction(address, uint256) external override {}
    function moduleBurnAction(address, uint256) external override {}

    /**
     * @dev Core validation logic called by ERC-3643 Token.sol during transfers.
     * Reverts the transaction immediately if it returns false.
     */
    function moduleCheck(
        address, // _from
        address, // _to
        uint256 _value,
        address // _compliance
    ) external view override returns (bool) {
        if (_value > maxRetailTxAmount) {
            return false;
        }
        return true;
    }

    function canComplianceBind(address) external pure override returns (bool) {
        return true;
    }

    function isPlugAndPlay() external pure override returns (bool) {
        return true;
    }

    function name() external pure override returns (string memory) {
        return 'RetailInvestorLimitModule';
    }
}
