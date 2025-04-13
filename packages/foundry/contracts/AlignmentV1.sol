//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract AlignmentV1 is AccessControl {
    mapping(address entity => mapping(address user => bool isAligned)) s_isUserAlignedToLocation;

    // Define role constants
    bytes32 public constant ALIGNMENT_ADDER_ROLE =
        keccak256("ALIGNMENT_ADDER_ROLE");
    bytes32 public constant ALIGNMENT_REMOVER_ROLE =
        keccak256("ALIGNMENT_REMOVER_ROLE");

    constructor(
        address[] memory admins,
        address[] memory alignmentAdders,
        address[] memory alignmentRemovers
    ) {
        for (uint256 i = 0; i < admins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, admins[i]);
        }
        for (uint256 i = 0; i < alignmentAdders.length; i++) {
            _grantRole(ALIGNMENT_ADDER_ROLE, alignmentAdders[i]);
        }
        for (uint256 i = 0; i < alignmentRemovers.length; i++) {
            _grantRole(ALIGNMENT_REMOVER_ROLE, alignmentRemovers[i]);
        }
    }

    function addAlignment(
        address entity,
        address user
    ) external onlyRole(ALIGNMENT_ADDER_ROLE) {
        s_isUserAlignedToLocation[entity][user] = true;
    }

    function removeAlignment(
        address entity,
        address user
    ) external onlyRole(ALIGNMENT_REMOVER_ROLE) {
        s_isUserAlignedToLocation[entity][user] = false;
    }

    function getUserAlignmentWithEntity(
        address entity,
        address user
    ) external view returns (bool isAligned) {
        isAligned = s_isUserAlignedToLocation[entity][user];
    }
}
