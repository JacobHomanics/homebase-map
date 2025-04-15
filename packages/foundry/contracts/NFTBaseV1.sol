//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./DistanceUtils.sol";

// import "./GeoDistance.sol";

interface IEAS {
    struct Attestation {
        bytes32 uid;
        bytes32 schema;
        uint64 time;
        uint64 expirationTime;
        uint64 revocationTime;
        bytes32 refUID;
        address attester;
        address recipient;
        bool revocable;
        bytes data;
    }

    function getAttestation(
        bytes32 uid
    ) external view returns (Attestation memory);
}

contract NFTBaseV1 is AccessControl, ERC721Enumerable {
    using DistanceUtils for int256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public immutable SCHEMA_UID;
    IEAS public immutable eas;

    string private uri;
    int256 public latitude;
    int256 public longitude;

    // Default range matching the frontend value (56327.04 meters = 35 miles)
    int256 public constant DEFAULT_RANGE_METERS = 56327040000000000000000;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address[] memory admins,
        address[] memory minters,
        int256 _latitude,
        int256 _longitude,
        address _eas,
        bytes32 _schemaUID
    ) ERC721(name, symbol) {
        uri = baseURI;
        latitude = _latitude;
        longitude = _longitude;
        eas = IEAS(_eas);
        SCHEMA_UID = _schemaUID;
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
    ) public virtual override(ERC721, IERC721) {
        require(
            from == address(0) || to == address(0),
            "This is a Soulbound token. It cannot be transferred."
        );
        super.transferFrom(from, to, tokenId);
    }

    function tokenURI(
        uint256
    ) public view virtual override returns (string memory) {
        return uri;
    }

    function mint(bytes32 attestationUID) external {
        // Get the attestation
        IEAS.Attestation memory attestation = eas.getAttestation(
            attestationUID
        );

        // Verify attestation requirements
        require(attestation.schema == SCHEMA_UID, "Invalid attestation schema");
        require(
            attestation.recipient == msg.sender,
            "Attestation recipient mismatch"
        );
        require(
            attestation.revocationTime == 0,
            "Attestation has been revoked"
        );

        if (attestation.expirationTime > 0) {
            require(
                block.timestamp < attestation.expirationTime,
                "Attestation has expired"
            );
        }

        // Decode the attestation data
        (, , , string memory location, , , , , ) = abi.decode(
            attestation.data,
            (
                uint256,
                string,
                string,
                string,
                string[],
                bytes[],
                string[],
                string[],
                string
            )
        );

        s_userLocation = location;

        // Parse location string to get coordinates
        (int256 userLat, int256 userLong) = _parseLocation(location);

        s_userLat = userLat;
        s_userLong = userLong;

        // Uncomment for distance restriction
        int256 distanceInMeters = DistanceUtils.getDistance(
            latitude,
            longitude,
            userLat,
            userLong
        );

        s_distanceInMeters = distanceInMeters;
        // require(
        //     distanceInMeters <= DEFAULT_RANGE_METERS,
        //     "User location too far from contract location"
        // );

        // _mint(msg.sender, totalSupply());
    }

    string public s_userLocation;
    int256 public s_distanceInMeters;
    int256 public s_userLat;
    int256 public s_userLong;

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

    // Helper for parsing locations
    function _parseLocation(
        string memory _location
    ) internal pure returns (int256 lat, int256 long) {
        bytes memory locationBytes = bytes(_location);
        require(locationBytes.length > 0, "Empty location string");

        uint256 commaIndex;
        bool foundComma = false;

        // Find the comma separator
        for (uint i = 0; i < locationBytes.length; i++) {
            if (locationBytes[i] == bytes1(",")) {
                commaIndex = i;
                foundComma = true;
                break;
            }
        }

        require(foundComma, "Invalid location format: no comma found");

        // Basic implementation - would need full parser in production
        string memory longitudeStr = _substring(_location, 0, commaIndex);
        string memory latitudeStr = _substring(
            _location,
            commaIndex + 1,
            locationBytes.length - commaIndex - 1
        );

        // Properly convert the strings to integers, preserving negative signs
        long = _stringToInt(longitudeStr);
        lat = _stringToInt(latitudeStr);

        return (lat, long);
    }

    function _substring(
        string memory str,
        uint startIndex,
        uint length
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(length);
        for (uint i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        return string(result);
    }

    function _stringToInt(string memory _str) internal pure returns (int256) {
        bytes memory b = bytes(_str);
        bool negative = false;
        uint start = 0;
        int256 result = 0;
        bool decimalFound = false;
        uint8 decimals = 0;

        // Skip leading whitespace if any
        while (start < b.length && (b[start] == " " || b[start] == "\t")) {
            start++;
        }

        // Check for negative sign
        if (start < b.length && b[start] == "-") {
            negative = true;
            start++;
        }

        for (uint i = start; i < b.length; i++) {
            uint8 c = uint8(bytes1(b[i]));

            if (c == 46) {
                // Decimal point '.'
                decimalFound = true;
                continue;
            }

            if (c >= 48 && c <= 57) {
                // Digits 0-9
                result = result * 10 + int256(uint256(c - 48));
                if (decimalFound) {
                    decimals++;
                }
            }
        }

        // Apply negative sign if necessary
        if (negative) {
            result = -result;
        }

        // Scale to 18 decimals
        if (decimals > 0) {
            // If we have less than 18 decimal places, multiply to reach 18
            if (decimals < 18) {
                result = result * int256(10 ** (18 - decimals));
            }
            // If we have more than 18 decimal places, divide to reach 18
            else if (decimals > 18) {
                result = result / int256(10 ** (decimals - 18));
            }
        } else {
            // No decimals found, scale to 18 decimal places
            result = result * 1_000_000_000_000_000_000;
        }

        return result;
    }

    // Combined utility functions to reduce contract size
    function getLocationInfo(
        int256 userLat,
        int256 userLong,
        int256 maxDistance
    )
        external
        view
        returns (
            int256 distance,
            bool isWithinRange,
            int256 contractLat,
            int256 contractLong
        )
    {
        distance = DistanceUtils.getDistance(
            latitude,
            longitude,
            userLat,
            userLong
        );
        isWithinRange =
            distance <= (maxDistance > 0 ? maxDistance : DEFAULT_RANGE_METERS);
        return (distance, isWithinRange, latitude, longitude);
    }
}
