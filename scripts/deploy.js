const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Diamond contract
  const Diamond = await hre.ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(deployer.address);  // Set deployer as the owner
  await diamond.deployed();

  console.log("Diamond deployed to:", diamond.address);

  // Deploy the facets
  const ContractAFacet = await hre.ethers.getContractFactory("ContractAFacet");
  const contractAFacet = await ContractAFacet.deploy();
  await contractAFacet.deployed();

  console.log("ContractAFacet deployed to:", contractAFacet.address);

  // Define the facet cut to add ContractAFacet
  const diamondCutTx = await diamond.diamondCut(
    [
      {
        facetAddress: contractAFacet.address,
        action: 0,  // Add
        functionSelectors: [
          "0x5c60da1b", // Replace this with the correct selector for ContractAFacet.setter
          "0x60d8f07e"  // Replace this with the correct selector for ContractAFacet.getter
        ]
      }
    ],
    hre.ethers.constants.AddressZero,  // No init function
    "0x"  // No calldata
  );

  await diamondCutTx.wait();

  console.log("DiamondCut executed");

  // Optionally, verify that the facets are correctly attached
  const diamondLoupe = await hre.ethers.getContractAt("IDiamondLoupe", diamond.address);
  const facets = await diamondLoupe.facets();
  console.log("Facets:", facets);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
