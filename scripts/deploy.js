const hre = require("hardhat");

async function main() {
  const [superAdmin] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", superAdmin.address);

  // Deploy the Diamond contract
  const Diamond = await hre.ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(superAdmin.address);  // Set superAdmin as the owner
  await diamond.deployed();

  console.log("Diamond deployed to:", diamond.address);

  // Deploy ContractAFacet
  const ContractAFacet = await hre.ethers.getContractFactory("ContractAFacet");
  const contractAFacet = await ContractAFacet.deploy();  // No arguments for constructor
  await contractAFacet.deployed();

  console.log("ContractAFacet deployed to:", contractAFacet.address);

  // Deploy ContractBFacet
  const ContractBFacet = await hre.ethers.getContractFactory("ContractBFacet");
  const contractBFacet = await ContractBFacet.deploy();  // No arguments for constructor
  await contractBFacet.deployed();

  console.log("ContractBFacet deployed to:", contractBFacet.address);

  // No facet is added to the Diamond in this script

  // Save addresses to addresses.json
  const fs = require('fs');
  const addresses = {
    diamond: diamond.address,
    contractAFacet: contractAFacet.address,
    contractBFacet: contractBFacet.address
  };
  fs.writeFileSync('addresses.json', JSON.stringify(addresses, null, 2));

  console.log("Addresses saved to addresses.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
