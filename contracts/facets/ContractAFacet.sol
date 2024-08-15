// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {DiamondStorage} from "../libraries/DiamondStorage.sol";

contract ContractAFacet is ReentrancyGuard {
    modifier onlyAdmin() {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(ds.admins[msg.sender], "Not an admin");
        _;
    }

    function initializeContractAFacet(address admin) external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(!ds.initialized, "Already initialized");
        ds.admins[admin] = true;
        ds.initialized = true;
    }

    function setter(uint256 num) external nonReentrant onlyAdmin {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.variable = num;  // Directly set the variable to the input value
    }

    function getter() external view returns (uint256) {
        return DiamondStorage.diamondStorage().variable;
    }
}
