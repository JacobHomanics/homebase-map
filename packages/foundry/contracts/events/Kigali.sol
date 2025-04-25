//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../NFTBaseV1.sol";

contract Kigali is NFTBaseV1 {
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
            -1970600000, // latitude in nanodegrees (-1.9706)
            30104400000, // longitude in nanodegrees (30.1044)
            eas,
            schemaUID
        )
    {}
}
