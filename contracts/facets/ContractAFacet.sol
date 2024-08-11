// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {DiamondStorage} from "../libraries/DiamondStorage.sol";

contract ContractAFacet is ReentrancyGuard {
    function setter(uint256 num) external nonReentrant {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.variable += num;
    }

    function getter() external view returns (uint256) {
        return DiamondStorage.diamondStorage().variable;
    }
}
