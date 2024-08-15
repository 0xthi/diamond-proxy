// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../interfaces/IDiamondLoupe.sol";
import "../Diamond.sol";

contract DiamondLoupeFacet is IDiamondLoupe {
    Diamond private diamond;

    constructor(address payable diamondAddress) {
        diamond = Diamond(diamondAddress);
    }

    function facetAddress(bytes4 _functionSelector) external view override returns (address) {
        return diamond.facetAddress(_functionSelector);
    }

    function facetFunctionSelectors(address _facet) external view override returns (bytes4[] memory) {
        return diamond.facetFunctionSelectors(_facet);
    }

    function facets() external view override returns (Facet[] memory) {
        return diamond.facets();
    }

    function facetAddresses() external view override returns (address[] memory) {
        // Assuming Diamond contract has a method facetAddresses
        return diamond.facetAddresses();
    }
}
