const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Diamond Proxy Upgrade with Admin Access", function () {
    let diamond, contractAFacet, contractBFacet, contractAFacetDiamond, contractBFacetDiamond;
    let superAdmin, admin, newAdmin;

    before(async function () {
        [superAdmin, admin, newAdmin] = await ethers.getSigners();

        // Deploy Diamond
        const Diamond = await ethers.getContractFactory("Diamond");
        diamond = await Diamond.deploy(superAdmin.address);
        await diamond.deployed();
        console.log("Diamond deployed at:", diamond.address);

        // Deploy ContractAFacet
        const ContractAFacet = await ethers.getContractFactory("ContractAFacet");
        contractAFacet = await ContractAFacet.deploy();
        await contractAFacet.deployed();
        console.log("ContractAFacet deployed at:", contractAFacet.address);

        // Initialize ContractAFacet
        await contractAFacet.initialize(admin.address);
        contractAFacetDiamond = await ContractAFacet.attach(diamond.address);
        console.log("ContractAFacet initialized with admin.");

        // Deploy ContractBFacet
        const ContractBFacet = await ethers.getContractFactory("ContractBFacet");
        contractBFacet = await ContractBFacet.deploy();
        await contractBFacet.deployed();
        console.log("ContractBFacet deployed at:", contractBFacet.address);

        // Initialize ContractBFacet
        await contractBFacet.initialize(superAdmin.address);
        contractBFacetDiamond = await ContractBFacet.attach(diamond.address);
        console.log("ContractBFacet initialized with superAdmin.");

        // Add Contract A facet to Diamond
        await diamond.diamondCut([{
            facetAddress: contractAFacet.address,
            action: 0, // Add
            functionSelectors: [
                contractAFacet.interface.getSighash("setter(uint256)"),
                contractAFacet.interface.getSighash("getter()")
            ]
        }], ethers.constants.AddressZero, "0x");
        console.log("ContractAFacet added to Diamond.");

        // Add Contract B facet to Diamond
        await diamond.diamondCut([{
            facetAddress: contractBFacet.address,
            action: 0, // Add
            functionSelectors: [
                contractBFacet.interface.getSighash("addAdmin(address)"),
                contractBFacet.interface.getSighash("removeAdmin(address)"),
                contractBFacet.interface.getSighash("transferAdminRole(address)"),
                contractBFacet.interface.getSighash("renounceAdminRole()"),
                contractBFacet.interface.getSighash("transferSuperAdmin(address)")
            ]
        }], ethers.constants.AddressZero, "0x");
        console.log("ContractBFacet added to Diamond.");

        // Super admin adds an admin
        await contractBFacetDiamond.connect(superAdmin).addAdmin(admin.address);
        console.log("Admin added by super admin.");

        // Set up an additional admin for further tests
        await contractBFacetDiamond.connect(superAdmin).addAdmin(newAdmin.address);
        console.log("New admin added by super admin.");
    });

    it("Should return 0 initially from ContractAFacet", async function () {
        const getterResult = await contractAFacetDiamond.getter();
        expect(getterResult).to.equal(0);
        console.log("Initial getter function test passed.");
    });

    it("Should set and get the correct value from ContractAFacet when called by an admin", async function () {
        await contractAFacetDiamond.connect(admin).setter(10);
        const getterResult = await contractAFacetDiamond.getter();
        expect(getterResult).to.equal(10);
        console.log("Setter and getter function test passed.");
    });

    it("Should emit AdminRoleTransferred event when admin role is transferred", async function () {
        await expect(
            contractBFacetDiamond.connect(admin).transferAdminRole(newAdmin.address)
        )
        .to.emit(contractBFacetDiamond, 'AdminRoleTransferred')
        .withArgs(admin.address, newAdmin.address);
        console.log("AdminRoleTransferred event test passed.");
    });

    it("Should emit AdminRoleRenounced event when admin role is renounced", async function () {
        await expect(
            contractBFacetDiamond.connect(newAdmin).renounceAdminRole()
        )
        .to.emit(contractBFacetDiamond, 'AdminRoleRenounced')
        .withArgs(newAdmin.address);
        console.log("AdminRoleRenounced event test passed.");
    });
});
