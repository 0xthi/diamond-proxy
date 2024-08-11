// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {DiamondStorage} from "../libraries/DiamondStorage.sol";

contract DiamondCutFacet is IDiamondCut {
    function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external override {
        for (uint256 i; i < _diamondCut.length; i++) {
            bytes4[] memory selectors = _diamondCut[i].functionSelectors;
            address facetAddress = _diamondCut[i].facetAddress;
            for (uint256 j; j < selectors.length; j++) {
                DiamondStorage.diamondStorage().selectorToFacet[selectors[j]] = facetAddress;
            }
        }
        if (_init != address(0)) {
            (bool success, bytes memory error) = _init.delegatecall(_calldata);
            require(success, string(error));
        }
    }
}
