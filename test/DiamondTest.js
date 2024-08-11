const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract A and B Interaction", function () {
  let diamond, contractAFacet, contractBFacet;
  let owner, newAdmin, superAdmin;

  before(async function () {
    [owner, newAdmin, superAdmin] = await ethers.getSigners();
    
    // Deploy Diamond and facets here (Contract A and Contract B)
    const Diamond = await ethers.getContractFactory("Diamond");
    diamond = await Diamond.deploy(owner.address);
    await diamond.deployed();

    const ContractAFacet = await ethers.getContractFactory("ContractAFacet");
    contractAFacet = await ContractAFacet.deploy();
    await contractAFacet.deployed();

    // Add Contract A facet to Diamond
    await diamond.diamondCut([{
      facetAddress: contractAFacet.address,
      action: 0, // Add
      functionSelectors: [
        "0x5c60da1b", // setter(uint256)
        "0x60d8f07e"  // getter()
      ]
    }], ethers.constants.AddressZero, "0x");
  });

  it("Should return 0 initially", async function () {
    expect(await diamond.getter()).to.equal(0);
  });

  it("Should set and get the correct value", async function () {
    await diamond.setter(10);
    expect(await diamond.getter()).to.equal(10);
  });

  it("Should fetch the admin address of contract A", async function () {
    const currentAdmin = await diamond.owner();
    expect(currentAdmin).to.equal(owner.address);
  });

  it("Should upgrade Contract A to inherit Contract B", async function () {
    // Deploy Contract B and add it as a facet
    const ContractBFacet = await ethers.getContractFactory("ContractBFacet");
    contractBFacet = await ContractBFacet.deploy();
    await contractBFacet.deployed();

    await diamond.diamondCut([{
      facetAddress: contractBFacet.address,
      action: 0, // Add
      functionSelectors: [
        // Add Contract B's functions
      ]
    }], ethers.constants.AddressZero, "0x");
  });

  it("Should change admin address of Contract A", async function () {
    await contractBFacet.addAdmin(newAdmin.address);
    await contractBFacet.transferAdminRole(newAdmin.address);
    expect(await diamond.owner()).to.equal(newAdmin.address);
  });

  it("Should perform final function calls after upgrade", async function () {
    expect(await diamond.getter()).to.equal(10);
    await diamond.connect(newAdmin).setter(81);
    expect(await diamond.getter()).to.equal(91);
  });
});
