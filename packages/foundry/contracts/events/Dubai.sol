//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../NFTBaseV1.sol";

contract Dubai is NFTBaseV1 {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address[] memory admins,
        address[] memory minters,
        address eas,
        bytes32 schemaUID
    )
        NFTBaseV1(
            name,
            symbol,
            baseURI,
            admins,
            minters,
            25276100000, // latitude in nanodegrees (25.2761)
            55296900000, // longitude in nanodegrees (55.2969)
            eas,
            schemaUID
        )
    {}
}
