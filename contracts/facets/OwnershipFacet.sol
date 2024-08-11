// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC173.sol";
import "../Diamond.sol";

contract OwnershipFacet is IERC173 {
    Diamond private diamond;

    constructor(address diamondAddress) {
        diamond = Diamond(diamondAddress);
    }

    function transferOwnership(address newOwner) public override {
        diamond.transferOwnership(newOwner);
    }

    function owner() public view override returns (address) {
        return diamond.owner();
    }
}
