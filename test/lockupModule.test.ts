import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { LockupModule } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("LockupModule - Custom Vested Staking/IPO Lock-up validation case", () => {
    let lockupModule: LockupModule;
    let owner: SignerWithAddress;
    let investor: SignerWithAddress;
    let fakeComplianceContract: SignerWithAddress;

    before(async () => {
        [owner, investor, fakeComplianceContract] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("LockupModule");
        lockupModule = (await Factory.deploy()) as LockupModule;
        await lockupModule.deployed();
    });

    it("should block transfers if the sender has an active lockup release time in the future", async () => {
        const from = investor.address;
        const to = owner.address;

        // Set lockup to 1 week from now
        const oneWeekFromNow = (await time.latest()) + 7 * 24 * 60 * 60;
        await lockupModule.setLockup(from, oneWeekFromNow);

        // The user tries to transfer before the deadline
        const isAllowed = await lockupModule.moduleCheck(
            from,
            to,
            100,
            fakeComplianceContract.address
        );

        expect(isAllowed).to.be.false;
    });

    it("should allow transfers if the lockup release time has already passed", async () => {
        const from = investor.address;
        const to = owner.address;

        // Fast-forward time by 8 days to simulate lockup expiration
        await time.increase(8 * 24 * 60 * 60);

        // The user tries to transfer after the deadline
        const isAllowed = await lockupModule.moduleCheck(
            from,
            to,
            100,
            fakeComplianceContract.address
        );

        expect(isAllowed).to.be.true;
    });

    it("should allow transfers if the admin removes the lockup restriction manually", async () => {
        const from = investor.address;
        const to = owner.address;

        // Set a new lockup deep into the future
        const oneYearFromNow = (await time.latest()) + 365 * 24 * 60 * 60;
        await lockupModule.setLockup(from, oneYearFromNow);

        // Verify it's blocked
        let isAllowed = await lockupModule.moduleCheck(from, to, 100, fakeComplianceContract.address);
        expect(isAllowed).to.be.false;

        // Admin manually removes lockup
        await lockupModule.removeLockup(from);

        // Should now be allowed
        isAllowed = await lockupModule.moduleCheck(from, to, 100, fakeComplianceContract.address);
        expect(isAllowed).to.be.true;
    });
});
