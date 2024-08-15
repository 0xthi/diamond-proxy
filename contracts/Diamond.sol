// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDiamondCut.sol";
import "./interfaces/IDiamondLoupe.sol";
import "./interfaces/IERC173.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract Diamond is IDiamondCut, IDiamondLoupe, IERC173, Ownable {
    // Events
    event DiamondCut(FacetCut[] _cut, address _init, bytes _calldata);

    // Storage structure
    struct DiamondStorage {
        mapping(bytes4 => address) functionSelectorToFacet;
        mapping(address => bytes4[]) facetFunctionSelectors;
        address[] facetAddresses;
    }

    // Internal storage
    DiamondStorage private ds;

    constructor(address initialOwner) Ownable(initialOwner) { }

    // DiamondCut function
    function diamondCut(FacetCut[] memory _cut, address _init, bytes memory _calldata) external override onlyOwner {
        for (uint256 i = 0; i < _cut.length; i++) {
            FacetCut memory facetCut = _cut[i];
            address _facetAddress = facetCut.facetAddress;
            bytes4[] memory functionSelectors = facetCut.functionSelectors;
            _addFunctionSelectors(_facetAddress, functionSelectors);
        }

        emit DiamondCut(_cut, _init, _calldata);

        if (_init != address(0)) {
            (bool success, ) = _init.delegatecall(_calldata);
            require(success, "Diamond: Initialization failed");
        }
    }

    // Function to add function selectors
    function _addFunctionSelectors(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        for (uint256 i = 0; i < _functionSelectors.length; i++) {
            bytes4 selector = _functionSelectors[i];
            _addFunctionSelector(selector, _facetAddress);
        }
    }

    function _addFunctionSelector(bytes4 _selector, address _facetAddress) internal {
        DiamondStorage storage ds_ = ds;
        ds_.functionSelectorToFacet[_selector] = _facetAddress;
        ds_.facetFunctionSelectors[_facetAddress].push(_selector);

        if (!_containsFacetAddress(_facetAddress)) {
            ds_.facetAddresses.push(_facetAddress);
        }
    }

    // Check if a facet address exists
    function _containsFacetAddress(address _facetAddress) internal view returns (bool) {
        DiamondStorage storage ds_ = ds;
        address[] storage facetAddresses_ = ds_.facetAddresses;
        for (uint256 i = 0; i < facetAddresses_.length; i++) {
            if (facetAddresses_[i] == _facetAddress) {
                return true;
            }
        }
        return false;
    }

    // Remove a facet address
    function _removeFacetAddress(address _facetAddress) internal {
        DiamondStorage storage ds_ = ds;
        address[] storage facetAddresses_ = ds_.facetAddresses;
        for (uint256 i = 0; i < facetAddresses_.length; i++) {
            if (facetAddresses_[i] == _facetAddress) {
                facetAddresses_[i] = facetAddresses_[facetAddresses_.length - 1];
                facetAddresses_.pop();
                return;
            }
        }
    }

    // Get facet address for a function selector
    function facetAddress(bytes4 _functionSelector) external view override returns (address) {
        return ds.functionSelectorToFacet[_functionSelector];
    }

    // Get function selectors for a facet address
    function facetFunctionSelectors(address _facetAddress) external view override returns (bytes4[] memory) {
        return ds.facetFunctionSelectors[_facetAddress];
    }

    // Get all facets
    function facets() external view override returns (Facet[] memory) {
        DiamondStorage storage ds_ = ds;
        Facet[] memory facets_ = new Facet[](ds_.facetAddresses.length);
        for (uint256 i = 0; i < ds_.facetAddresses.length; i++) {
            facets_[i] = Facet({
                facetAddress: ds_.facetAddresses[i],
                functionSelectors: ds_.facetFunctionSelectors[ds_.facetAddresses[i]]
            });
        }
        return facets_;
    }

    // Get all facet addresses
    function facetAddresses() external view override returns (address[] memory) {
        return ds.facetAddresses;
    }

    // Check if the contract supports an interface
    function supportsInterface(bytes4 _interfaceId) external pure returns (bool) {
        return _interfaceId == type(IDiamondCut).interfaceId || 
               _interfaceId == type(IDiamondLoupe).interfaceId || 
               _interfaceId == type(IERC173).interfaceId;
    }

    // Transfer contract ownership
    function transferOwnership(address newOwner) public override(Ownable, IERC173) onlyOwner {
        super.transferOwnership(newOwner);
    }

    // Get contract owner
    function owner() public view override(Ownable, IERC173) returns (address) {
        return super.owner();
    }

    // Fallback function for delegation
    fallback() external payable {
        DiamondStorage storage ds_ = ds;
        bytes4 functionSelector = bytes4(msg.data[:4]);
        address facet = ds_.functionSelectorToFacet[functionSelector];
        require(facet != address(0), "Diamond: Function does not exist");

        (bool success, bytes memory result) = facet.delegatecall(msg.data);
        require(success, "Diamond: Delegatecall failed");

        assembly {
            return(add(result, 32), mload(result))
        }
    }

    // Receive function for receiving ETH
    receive() external payable {}
}
