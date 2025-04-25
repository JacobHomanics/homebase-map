//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../NFTBaseV1.sol";

contract AngelesCity is NFTBaseV1 {
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
            15147100000, // latitude in nanodegrees (15.1471)
            120589700000, // longitude in nanodegrees (120.5897)
            eas,
            schemaUID
        )
    {}
}
