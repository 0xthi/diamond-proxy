// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library DiamondStorage {
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.diamond.storage");

    struct DiamondStorageStruct {
        mapping(bytes4 => address) selectorToFacet;
        address contractOwner;
        mapping(address => bool) admins;
        uint256 variable;
    }

    function diamondStorage() internal pure returns (DiamondStorageStruct storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }
}
