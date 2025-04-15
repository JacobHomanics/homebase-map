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

    int256[2] public coordinates;

    // int256 public latitude;
    // int256 public longitude;

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

        coordinates[0] = _latitude; // latitude
        coordinates[1] = _longitude; // longitude

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
        (int256 attestationLatitude, int256 attestationLongitude) = abi.decode(
            attestation.data,
            (int256, int256)
        );

        // s_userLocation = location;

        // Parse location string to get coordinates
        // (int256 userLat, int256 userLong) = _parseLocation(location);

        // // Ensure coordinates have exactly 18 decimal places
        // // Fixed scale to 10^18 (18 decimal places)
        // int256 scale = 1_000_000_000_000_000_000; // 10^18

        // // Count digits in userLat to determine current scale
        // int256 absLat = userLat < 0 ? -userLat : userLat;
        // int256 absLong = userLong < 0 ? -userLong : userLong;

        // // If latitude has 17 decimal places (common issue), add one more zero
        // if (absLat > 0 && absLat < scale / 10) {
        //     userLat *= 10;
        // }

        // // If longitude has 17 decimal places, add one more zero
        // if (absLong > 0 && absLong < scale / 10) {
        //     userLong *= 10;
        // }

        // s_userLat = userLat;
        // s_userLong = userLong;

        // Uncomment for distance restriction
        // int256 distanceInMeters = DistanceUtils.getDistance(
        //     latitude,
        //     longitude,
        //     userLat, // these are reversed due to attestation
        //     userLong
        // );

        // s_distanceInMeters = distanceInMeters;

        int256 bufferMeters = 35; // 35 meters
        int256 bufferLatNanodegrees = metersToNanodegreesLatitude(bufferMeters);
        int256 bufferLonNanodegrees = metersToNanodegreesLongitude(
            bufferMeters,
            coordinates[0]
        );

        int256[2][2] memory bbox;
        // Lower left
        bbox[0][0] = coordinates[0] - bufferLatNanodegrees;
        bbox[0][1] = coordinates[1] - bufferLonNanodegrees;
        // Upper right
        bbox[1][0] = coordinates[0] + bufferLatNanodegrees;
        bbox[1][1] = coordinates[1] + bufferLonNanodegrees;

        bool isInBbox = attestationLatitude > bbox[0][0] &&
            attestationLatitude < bbox[1][0] &&
            attestationLongitude > bbox[0][1] &&
            attestationLongitude < bbox[1][1];

        // lastCoords = [attestationLatitude, attestationLongitude];
        require(isInBbox, "User location too far from contract location");

        _mint(msg.sender, totalSupply());
    }

    // int256[] public lastCoords;

    // string public s_userLocation;
    // int256 public s_distanceInMeters;
    // int256 public s_userLat;
    // int256 public s_userLong;

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

        // Always scale to exactly 18 decimal places (fixed-point format required by distance calculations)
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

        // Validation: ensure the result has exactly 18 decimal places
        int256 scale = 1_000_000_000_000_000_000; // 10^18
        int256 absResult = result < 0 ? -result : result;

        // If result has 17 decimal places (common issue), add one more zero
        if (
            absResult > 0 && absResult < scale / 10 && absResult >= scale / 100
        ) {
            result *= 10;
        }

        return result;
    }

    // Combined utility functions to reduce contract size
    // function getLocationInfo(
    //     int256 userLat,
    //     int256 userLong,
    //     int256 maxDistance
    // )
    //     external
    //     view
    //     returns (
    //         int256 distance,
    //         bool isWithinRange,
    //         int256 contractLat,
    //         int256 contractLong
    //     )
    // {
    //     distance = DistanceUtils.getDistance(
    //         latitude,
    //         longitude,
    //         userLat,
    //         userLong
    //     );
    //     isWithinRange =
    //         distance <= (maxDistance > 0 ? maxDistance : DEFAULT_RANGE_METERS);
    //     return (distance, isWithinRange, latitude, longitude);
    // }

    int256 constant METERS_TO_NANODEGREES_AT_EQUATOR = 9; // 0.000009 * 10^9

    // Calculate nanodegrees from meters, adjusting for latitude
    // The formula accounts for the fact that longitude degrees get smaller as you move away from the equator
    function metersToNanodegreesLongitude(
        int256 meters,
        int256 latitudeNanodegrees
    ) internal pure returns (int256) {
        // For longitude, degrees get smaller as you move away from the equator
        // Approximate formula: meters_in_one_degree = 111000 * cos(latitude)
        // We use a simplified approach for the blockchain
        int256 factor = METERS_TO_NANODEGREES_AT_EQUATOR;

        // Simple adjustment for latitude - the closer to poles, the smaller the longitude degrees
        // This is a very rough approximation
        if (latitudeNanodegrees > 0) {
            // Northern hemisphere
            if (latitudeNanodegrees > 60 * 10 ** 9)
                // Above 60 degrees north
                factor = factor * 2; // Double the nanodegrees to account for smaller distance
            else if (latitudeNanodegrees > 30 * 10 ** 9)
                // Between 30-60 degrees north
                factor = (factor * 3) / 2; // Multiply by 1.5
        } else {
            // Southern hemisphere
            if (latitudeNanodegrees < -60 * 10 ** 9)
                // Below 60 degrees south
                factor = factor * 2;
            else if (latitudeNanodegrees < -30 * 10 ** 9)
                // Between 30-60 degrees south
                factor = (factor * 3) / 2;
        }

        return meters * factor;
    }

    // For latitude, one degree is consistently ~111,000 meters everywhere on Earth
    function metersToNanodegreesLatitude(
        int256 meters
    ) internal pure returns (int256) {
        return meters * METERS_TO_NANODEGREES_AT_EQUATOR;
    }
}
