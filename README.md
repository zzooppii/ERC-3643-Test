# ERC-3643 Modular Compliance Integration Test

This repository contains an experimental implementation and test suite built on top of the ERC-3643 (formerly T-REX) standard protocol for permissioned tokens. 

The primary goal of this project is to demonstrate an understanding of the ERC-3643 `ModularCompliance` framework by designing, implementing, and testing custom compliance modules tailored for specific regulatory bounds, such as limiting transaction amounts for retail investors and enforcing lock-up vesting periods in a Security Token Offering (STO).

## Overview

The ERC-3643 standard enforces regulatory compliance (KYC/AML) on the smart contract level before any token transfer can occur. It achieves this by maintaining an Identity Registry and a Compliance Contract. 

Instead of modifying the core token logic, I leveraged the **Modular Compliance** architecture to seamlessly integrate custom legal requirements as independent, reusable modules.

### Key Features Implemented:

1. **Retail Investor Limit Module (`contracts/compliance/modular/modules/RetailInvestorLimitModule.sol`)**
   - Validates the transfer amounts dynamically during the standard `transfer` / `transferFrom` calls.
   - Automatically reverts the transaction if an investor attempts to transfer more tokens than their legally allowed threshold.
   - Implements administrative functionalities (`onlyOwner`) to simulate dynamic regulatory changes (e.g., financial authority increasing the transaction limit).

2. **Time-Based Lock-up Module (`contracts/compliance/modular/modules/LockupModule.sol`)**
   - Enforces a vesting/lock-up period for early investors or founders (e.g., restricted for 6 months after Token Generation Event).
   - Dynamically checks `block.timestamp` against the user's registered release time before allowing any outgoing transfers.
   - Allows the issuer to manually lift restrictions if granted an early release.

3. **Automated Test Suite (`test/retailInvestorLimit.test.ts` & `test/lockupModule.test.ts`)**
   - Built with Hardhat and Ethers.js.
   - Simulates full edge cases for testing boundary validations, time manipulation (`time.increase`), and admin role overrides.

## Getting Started

### 1. Installation

Clone this repository and install dependencies:

```bash
npm install
```

### 2. Compilation

Compile the ERC-3643 core suite along with the custom modules:

```bash
npx hardhat compile
```

### 3. Testing 

Execute the custom compliance test suites:

```bash
npx hardhat test test/retailInvestorLimit.test.ts
npx hardhat test test/lockupModule.test.ts
```

*Expected Output for Lock-up Module:*
```text
  LockupModule - Custom Vested Staking/IPO Lock-up validation case
    ✔ should block transfers if the sender has an active lockup release time in the future
    ✔ should allow transfers if the lockup release time has already passed
    ✔ should allow transfers if the admin removes the lockup restriction manually
```

## References
- Core Contracts from the Official [ERC-3643 Organization](https://github.com/ERC-3643)
- Custom modules developed extending `AbstractModule.sol` and integrated with `ModularCompliance.sol`.
