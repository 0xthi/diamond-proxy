// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {DiamondStorage} from "../libraries/DiamondStorage.sol";

contract ContractBFacet {
    address public superAdmin;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event SuperAdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event AdminRoleTransferred(address indexed oldAdmin, address indexed newAdmin);
    event AdminRoleRenounced(address indexed admin);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Not super admin");
        _;
    }

    modifier onlyAdmin() {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(ds.admins[msg.sender], "Not an admin");
        _;
    }

    // Initialize function to replace constructor
    function initializeContractBFacet(address _superAdmin) external {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        require(!ds.initialized, "Already initialized");
        require(_superAdmin != address(0), "Invalid super admin address");
        superAdmin = _superAdmin;
        emit SuperAdminTransferred(address(0), _superAdmin);
    }

    function addAdmin(address admin) external onlySuperAdmin {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.admins[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlySuperAdmin {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function transferAdminRole(address newAdmin) external onlyAdmin {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.admins[msg.sender] = false;
        ds.admins[newAdmin] = true;
        emit AdminRoleTransferred(msg.sender, newAdmin);
    }

    function renounceAdminRole() external onlyAdmin {
        DiamondStorage.DiamondStorageStruct storage ds = DiamondStorage.diamondStorage();
        ds.admins[msg.sender] = false;
        emit AdminRoleRenounced(msg.sender);
    }

    function transferSuperAdmin(address newSuperAdmin) external onlySuperAdmin {
        require(newSuperAdmin != address(0), "Invalid new super admin address");
        emit SuperAdminTransferred(superAdmin, newSuperAdmin);
        superAdmin = newSuperAdmin;
    }

    function isAdmin(address admin) external view returns (bool) {
        return DiamondStorage.diamondStorage().admins[admin];
    }
}
