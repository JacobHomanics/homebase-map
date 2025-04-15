//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public immutable SCHEMA_UID;
    IEAS public immutable eas;

    string private uri;
    int256 public latitude;
    int256 public longitude;
    uint256 public constant EARTH_RADIUS = 6371; // Earth's radius in kilometers
    uint256 public constant MAX_DISTANCE = 1; // Maximum allowed distance in kilometers
    uint256 private constant SCALING_FACTOR = 10000000; // 10^7 for coordinate precision

    // Helper function to convert from integer to floating point
    function _toFloat(int256 value) internal pure returns (int256) {
        return value / int256(SCALING_FACTOR);
    }

    // Calculate distance between two points using Haversine formula
    function _calculateDistance(
        int256 lat1,
        int256 lon1,
        int256 lat2,
        int256 lon2
    ) internal pure returns (uint256) {
        // First scale down the coordinates to reduce the size of numbers
        lat1 = lat1 / 1000;
        lon1 = lon1 / 1000;
        lat2 = lat2 / 1000;
        lon2 = lon2 / 1000;

        // Convert to radians with smaller numbers
        int256 lat1Rad = (lat1 * 314159) / (180 * 100000);
        int256 lon1Rad = (lon1 * 314159) / (180 * 100000);
        int256 lat2Rad = (lat2 * 314159) / (180 * 100000);
        int256 lon2Rad = (lon2 * 314159) / (180 * 100000);

        int256 dLat = lat2Rad - lat1Rad;
        int256 dLon = lon2Rad - lon1Rad;

        // Haversine formula components with scaled down numbers
        int256 a = _sin2(dLat / 2) +
            (_cos(lat1Rad) * _cos(lat2Rad) * _sin2(dLon / 2)) /
            1e18;

        int256 c = 2 * _asin(_sqrt(a));

        // Scale the result back up and multiply by Earth's radius
        return uint256((c * int256(EARTH_RADIUS)) / 1e9);
    }

    // Improved sin^2 function with overflow protection
    function _sin2(int256 x) internal pure returns (int256) {
        x = x % 6283185; // 2π * 1e6 to prevent large inputs
        return (x * x) / 1e9;
    }

    // Improved cos function with overflow protection
    function _cos(int256 x) internal pure returns (int256) {
        x = x % 6283185; // 2π * 1e6 to prevent large inputs
        return 1e9 - (x * x) / 2;
    }

    // Simple approximation of asin
    function _asin(int256 x) internal pure returns (int256) {
        return x + (x * x * x) / 6;
    }

    // Simple approximation of sqrt using Newton's method
    function _sqrt(int256 x) internal pure returns (int256) {
        if (x == 0) return 0;
        int256 z = (x + 1e18) / 2;
        int256 y = x;
        for (uint256 i = 0; i < 3; i++) {
            y = z;
            z = (z + x / z) / 2;
        }
        return y;
    }

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

    uint256 public s_eventTimestamp;
    string public s_srs;
    string public s_locationType;
    string public s_location;
    string[] public s_recipeType;
    bytes[] public s_recipePayload;

    // string[] public s_mediaType;
    // string[] public s_mediaData;
    // string public s_memo;

    // bytes public data;

    // IEAS.Attestation public s_attestation;

    function mint(bytes32 attestationUID) external {
        // Get the attestation
        IEAS.Attestation memory attestation = eas.getAttestation(
            attestationUID
        );

        // s_attestation = attestation;
        // Verify the attestation is for the correct schema
        require(attestation.schema == SCHEMA_UID, "Invalid attestation schema");

        // Verify the attestation is for the recipient
        require(
            attestation.recipient == msg.sender,
            "Attestation recipient mismatch"
        );

        // Verify the attestation hasn't been revoked
        require(
            attestation.revocationTime == 0,
            "Attestation has been revoked"
        );

        // Verify the attestation hasn't expired (if it has an expiration)
        if (attestation.expirationTime > 0) {
            require(
                block.timestamp < attestation.expirationTime,
                "Attestation has expired"
            );
        }

        // data = attestation.data;

        // Decode the attestation data
        (
            uint256 eventTimestamp,
            string memory srs,
            string memory locationType,
            string memory location,
            string[] memory recipeType,
            bytes[] memory recipePayload,
            string[] memory mediaType,
            string[] memory mediaData,
            string memory memo
        ) = abi.decode(
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

        s_location = location;
        s_eventTimestamp = eventTimestamp;
        s_srs = srs;
        s_locationType = locationType;
        s_recipeType = recipeType;
        s_recipePayload = recipePayload;
        // s_mediaType = mediaType;
        // s_mediaData = mediaData;
        // s_memo = memo;

        // Parse the location string which should be in "lat,long" format
        (int256 userLat, int256 userLong) = _parseLocation(location);

        uint256 distance = _calculateDistance(
            latitude,
            longitude,
            userLat,
            userLong
        );

        require(
            distance <= MAX_DISTANCE,
            "Location too far from the designated coordinates"
        );

        // _mint(msg.sender, totalSupply());
    }

    // Helper function to parse location string
    function _parseLocation(
        string memory _location
    ) internal pure returns (int256 lat, int256 long) {
        bytes memory locationBytes = bytes(_location);
        require(locationBytes.length > 0, "Empty location string");
        require(locationBytes.length <= 50, "Location string too long");

        // Add debug output for the location string
        require(
            bytes(_location).length > 0,
            string(abi.encodePacked("Location string: ", _location))
        );

        uint256 commaIndex;
        bool foundComma = false;
        uint256 start = 0;
        uint256 end = locationBytes.length;

        // Trim leading spaces
        while (start < end && locationBytes[start] == " ") {
            start++;
        }
        // Trim trailing spaces
        while (end > start && locationBytes[end - 1] == " ") {
            end--;
        }

        require(end > start, "Location string is all spaces");

        // Find the comma separator, ignoring spaces
        for (uint i = start; i < end; i++) {
            if (locationBytes[i] == bytes1(",")) {
                commaIndex = i;
                foundComma = true;
                break;
            }
        }

        require(foundComma, "Invalid location format: no comma found");
        require(commaIndex > start, "Invalid location format: no latitude");
        require(commaIndex < end - 1, "Invalid location format: no longitude");

        // Split the string and convert to integers, trimming spaces
        string memory latStr = _trimSpaces(
            _substring(_location, start, commaIndex - start)
        );
        string memory longStr = _trimSpaces(
            _substring(_location, commaIndex + 1, end - (commaIndex + 1))
        );

        // Add debug output for the split strings
        require(
            bytes(latStr).length > 0,
            string(abi.encodePacked("Latitude string: ", latStr))
        );
        require(
            bytes(longStr).length > 0,
            string(abi.encodePacked("Longitude string: ", longStr))
        );

        lat = _stringToInt(latStr);
        long = _stringToInt(longStr);

        // Validate coordinate ranges
        require(
            lat >= -90 * int256(SCALING_FACTOR) &&
                lat <= 90 * int256(SCALING_FACTOR),
            "Latitude out of range"
        );
        require(
            long >= -180 * int256(SCALING_FACTOR) &&
                long <= 180 * int256(SCALING_FACTOR),
            "Longitude out of range"
        );

        return (lat, long);
    }

    // Helper function to trim spaces from a string
    function _trimSpaces(
        string memory str
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint256 start = 0;
        uint256 end = strBytes.length;

        while (start < end && strBytes[start] == " ") {
            start++;
        }
        while (end > start && strBytes[end - 1] == " ") {
            end--;
        }

        if (end <= start) {
            return "";
        }

        bytes memory result = new bytes(end - start);
        for (uint i = 0; i < end - start; i++) {
            result[i] = strBytes[start + i];
        }
        return string(result);
    }

    // Helper function to get substring
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

    // Helper function to convert string to integer with improved safety
    function _stringToInt(string memory _str) internal pure returns (int256) {
        bytes memory b = bytes(_str);
        require(b.length > 0, "Empty string");
        require(b.length <= 20, "String too long");

        bool negative = false;
        uint start = 0;

        if (b[0] == "-") {
            negative = true;
            start = 1;
        }

        int256 result = 0;
        bool decimalFound = false;
        uint256 decimals = 0;
        uint256 maxDecimals = 7; // Match SCALING_FACTOR

        for (uint i = start; i < b.length && decimals <= maxDecimals; i++) {
            uint8 c = uint8(bytes1(b[i]));

            // Skip spaces
            if (c == 32) {
                // ASCII code for space
                continue;
            }

            // Add debug requirements to identify problematic characters
            require(
                c == 45 || // hyphen (-)
                    c == 46 || // decimal point (.)
                    (c >= 48 && c <= 57), // digits 0-9
                string(
                    abi.encodePacked(
                        "Invalid character code: ",
                        Strings.toString(c)
                    )
                )
            );

            if (c == 46) {
                // ASCII code for '.'
                require(!decimalFound, "Multiple decimal points");
                decimalFound = true;
                continue;
            }

            if (c != 45) {
                // Skip the hyphen
                require(
                    c >= 48 && c <= 57, // ASCII codes for '0' through '9'
                    "Invalid character in number"
                );
                uint8 digit = c - 48; // 48 is ASCII for '0'

                if (!decimalFound) {
                    // Check for overflow before multiplying
                    require(
                        result <= type(int256).max / 10,
                        "Integer overflow"
                    );
                    result = result * 10 + int256(uint256(digit));
                } else {
                    decimals++;
                    if (decimals <= maxDecimals) {
                        // Check for overflow before multiplying
                        require(
                            result <= type(int256).max / 10,
                            "Decimal overflow"
                        );
                        result = result * 10 + int256(uint256(digit));
                    }
                }
            }
        }

        // Pad with zeros if needed
        while (decimals < maxDecimals) {
            // Check for overflow before multiplying
            require(result <= type(int256).max / 10, "Padding overflow");
            result *= 10;
            decimals++;
        }

        if (negative) {
            require(result <= type(int256).max, "Negative overflow");
            result = -result;
        }

        return result;
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
