// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import './AbstractModule.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title LockupModule
 * @dev Custom compliance module for enforcing lock-up (vesting) periods on specific investor wallets.
 * In a traditional STO or IPO, early investors or founders are legally restricted from moving or selling
 * their assets for a certain period (e.g., 6 months lock-up).
 */
contract LockupModule is AbstractModule, Ownable {
    // Mapping to store the exact timestamp when a wallet is allowed to transfer tokens
    mapping(address => uint256) public lockupReleaseTime;

    /**
     * @dev Sets a lockup release timestamp for a specific wallet.
     * Can only be called by the admin/issuer.
     * @param _wallet The address of the investor
     * @param _releaseTime The Unix timestamp after which transfers are allowed
     */
    function setLockup(address _wallet, uint256 _releaseTime) external onlyOwner {
        lockupReleaseTime[_wallet] = _releaseTime;
    }

    /**
     * @dev Unlocks a wallet immediately.
     */
    function removeLockup(address _wallet) external onlyOwner {
        lockupReleaseTime[_wallet] = 0;
    }

    // AbstractModule standard overrides
    function moduleTransferAction(address, address, uint256) external override {}
    function moduleMintAction(address, uint256) external override {}
    function moduleBurnAction(address, uint256) external override {}

    /**
     * @dev Core validation logic called by ERC-3643 Token.sol during transfers.
     * Blocks transfer if the sender's current time is before their lockup release time.
     */
    function moduleCheck(
        address _from,
        address, // _to
        uint256, // _value
        address // _compliance
    ) external view override returns (bool) {
        // If the sender has an active lockup and the current block time is less than it, revert.
        if (lockupReleaseTime[_from] > 0 && block.timestamp < lockupReleaseTime[_from]) {
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
        return 'LockupModule';
    }
}
