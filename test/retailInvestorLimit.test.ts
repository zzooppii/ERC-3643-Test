import { expect } from "chai";
import { ethers } from "hardhat";
import { RetailInvestorLimitModule } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("RetailInvestorLimitModule - Custom Compliance validation case", () => {
    let complianceModule: RetailInvestorLimitModule;
    let owner: SignerWithAddress;
    let investor: SignerWithAddress;
    let fakeComplianceContract: SignerWithAddress;

    before(async () => {
        [owner, investor, fakeComplianceContract] = await ethers.getSigners();

        // Initial limit: 5,000,000 tokens (assumes 18 decimals)
        const initialLimit = ethers.utils.parseEther("5000000");

        const Factory = await ethers.getContractFactory("RetailInvestorLimitModule");
        complianceModule = (await Factory.deploy(initialLimit)) as RetailInvestorLimitModule;
        await complianceModule.deployed();
    });

    it("should block transfers exceeding the maximum retail transaction limit", async () => {
        const from = owner.address;
        const to = investor.address;

        // Attempting to transfer 5,000,001 (exceeds limit by 1 wei equivalent) -> should be blocked
        const overLimitAmount = ethers.utils.parseEther("5000001");

        const isAllowed = await complianceModule.moduleCheck(
            from,
            to,
            overLimitAmount,
            fakeComplianceContract.address
        );

        expect(isAllowed).to.be.false;
    });

    it("should allow transfers within the maximum retail transaction limit", async () => {
        const from = owner.address;
        const to = investor.address;

        // Attempting to transfer 5,000,000 (exactly at the limit) -> should be allowed
        const validAmount = ethers.utils.parseEther("5000000");

        const isAllowed = await complianceModule.moduleCheck(
            from,
            to,
            validAmount,
            fakeComplianceContract.address
        );

        expect(isAllowed).to.be.true;
    });

    it("should allow previously blocked transactions if the admin increases the limit", async () => {
        // Admin updates the limit to 10,000,000
        const newLimit = ethers.utils.parseEther("10000000");
        await complianceModule.setMaxRetailTxAmount(newLimit);

        const from = owner.address;
        const to = investor.address;

        // The previously blocked amount of 5,000,001 should now be allowed
        const overLimitAmount = ethers.utils.parseEther("5000001");
        const isAllowed = await complianceModule.moduleCheck(
            from,
            to,
            overLimitAmount,
            fakeComplianceContract.address
        );

        expect(isAllowed).to.be.true;
    });
});
