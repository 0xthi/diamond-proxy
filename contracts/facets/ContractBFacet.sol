// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {DiamondStorage} from "../libraries/DiamondStorage.sol";

contract ContractBFacet {
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    function addAdmin(address admin) external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(msg.sender == ds.contractOwner, "Not contract owner");
        ds.admins[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(msg.sender == ds.contractOwner, "Not contract owner");
        ds.admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function transferAdminRole(address newAdmin) external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(ds.admins[msg.sender], "Not an admin");
        ds.admins[msg.sender] = false;
        ds.admins[newAdmin] = true;
    }

    function renounceAdminRole() external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(ds.admins[msg.sender], "Not an admin");
        ds.admins[msg.sender] = false;
    }

    function getAdmin(address admin) external view returns (bool) {
        return DiamondStorage.diamondStorage().admins[admin];
    }
}
