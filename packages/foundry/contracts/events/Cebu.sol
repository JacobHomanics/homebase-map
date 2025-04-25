//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../NFTBaseV1.sol";

contract Cebu is NFTBaseV1 {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address[] memory admins,
        address[] memory minters,
        address eas,
        bytes32 schemaUID,
        uint256 mintStartTime,
        uint256 mintEndTime
    )
        NFTBaseV1(
            name,
            symbol,
            baseURI,
            admins,
            minters,
            10318500000, // latitude in nanodegrees (10.3185)
            123917500000, // longitude in nanodegrees (123.9175)
            eas,
            schemaUID,
            mintStartTime,
            mintEndTime
        )
    {}
}
