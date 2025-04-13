//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Country {
    mapping(address country => string name) s_countryName;

    function getCountryName(
        address country
    ) external view returns (string memory name) {
        name = s_countryName[country];
    }
}
