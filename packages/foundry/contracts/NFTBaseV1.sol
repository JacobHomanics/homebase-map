//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTBaseV1 is AccessControl, ERC721Enumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    string private uri;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address[] memory admins,
        address[] memory minters
    ) ERC721(name, symbol) {
        uri = baseURI;
        for (uint256 i = 0; i < admins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, admins[i]);
        }
        for (uint256 i = 0; i < minters.length; i++) {
            _grantRole(MINTER_ROLE, minters[i]);
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        require(
            from == address(0) || to == address(0),
            "This is a Soulbound token. It cannot be transferred."
        );
        super.transferFrom(from, to, tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return uri;

        // "https://bafkreigrb5r3qqpxylnuk6aiycudyyzovfm62mrooettegrxrdnyfdurqi.ipfs.w3s.link/";
        // string.concat(
        //     "https://api.example.com/token/",
        //     Strings.toString(tokenId)
        // );
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
