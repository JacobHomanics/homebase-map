//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTV1 is AccessControl, ERC721Enumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
        address[] memory admins,
        address[] memory minters
    ) ERC721("NFT", "NFT") {
        for (uint256 i = 0; i < admins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, admins[i]);
        }
        for (uint256 i = 0; i < minters.length; i++) {
            _grantRole(MINTER_ROLE, minters[i]);
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return
            string.concat(
                "https://api.example.com/token/",
                Strings.toString(tokenId)
            );
    }

    function mint(address to) external onlyRole(MINTER_ROLE) {
        _mint(to, totalSupply());
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
