//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./LatLongDistance.sol";

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
    using LatLonDistance for int256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public immutable SCHEMA_UID;
    IEAS public immutable eas;

    string private uri;
    int256 public latitude;
    int256 public longitude;

    // Optional: Uncomment and set this value to enable distance-based minting restriction
    // int256 public constant MAX_DISTANCE_METERS = 50000000000000000000000; // 50km with 18 decimal places

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

    function mint(bytes32 attestationUID) external {
        // Get the attestation
        IEAS.Attestation memory attestation = eas.getAttestation(
            attestationUID
        );

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

        // Parse location string to get coordinates
        (int256 userLat, int256 userLong) = _parseLocation(location);

        // DISTANCE RESTRICTION EXAMPLE:
        // To enable distance-based minting restriction, uncomment the following lines
        // and set DEFAULT_RANGE_METERS or use your own custom value:

        int256 distanceInMeters = getDistanceFromContract(userLat, userLong);
        require(
            distanceInMeters <= DEFAULT_RANGE_METERS,
            "User location too far from contract location"
        );

        _mint(msg.sender, totalSupply());
    }

    // Helper function to parse location string
    function _parseLocation(
        string memory _location
    ) internal pure returns (int256 lat, int256 long) {
        bytes memory locationBytes = bytes(_location);
        require(locationBytes.length > 0, "Empty location string");
        require(locationBytes.length <= 50, "Location string too long");

        uint256 commaIndex;
        bool foundComma = false;
        uint256 start = 0;
        uint256 end = locationBytes.length;

        // Trim leading spaces
        while (
            start < end &&
            (locationBytes[start] == " " || locationBytes[start] == "\t")
        ) {
            start++;
        }
        // Trim trailing spaces
        while (
            end > start &&
            (locationBytes[end - 1] == " " || locationBytes[end - 1] == "\t")
        ) {
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
        require(
            commaIndex > start,
            "Invalid location format: no first coordinate"
        );
        require(
            commaIndex < end - 1,
            "Invalid location format: no second coordinate"
        );

        // Split the string and convert to integers, trimming spaces
        string memory firstCoord = _trimSpaces(
            _substring(_location, start, commaIndex - start)
        );
        string memory secondCoord = _trimSpaces(
            _substring(_location, commaIndex + 1, end - (commaIndex + 1))
        );

        // Parse the coordinates - expecting "longitude,latitude" format
        long = _stringToInt(firstCoord);
        lat = _stringToInt(secondCoord);

        return (lat, long);
    }

    // Helper function to trim spaces from a string
    function _trimSpaces(
        string memory str
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint256 start = 0;
        uint256 end = strBytes.length;

        while (
            start < end && (strBytes[start] == " " || strBytes[start] == "\t")
        ) {
            start++;
        }
        while (
            end > start &&
            (strBytes[end - 1] == " " || strBytes[end - 1] == "\t")
        ) {
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
        int256 result = 0;
        bool decimalFound = false;
        uint256 decimals = 0;
        uint256 maxDecimals = 7; // Match SCALING_FACTOR

        if (b[0] == "-") {
            negative = true;
            start = 1;
        }

        for (uint i = start; i < b.length && decimals <= maxDecimals; i++) {
            uint8 c = uint8(bytes1(b[i]));

            if (c == 46) {
                // decimal point
                require(!decimalFound, "Multiple decimal points");
                decimalFound = true;
                continue;
            }

            if (c >= 48 && c <= 57) {
                // digits 0-9
                uint8 digit = c - 48;
                if (decimalFound) {
                    decimals++;
                    if (decimals <= maxDecimals) {
                        result = result * 10 + int256(uint256(digit));
                    }
                } else {
                    result = result * 10 + int256(uint256(digit));
                }
            } else if (c != 32) {
                // not a space
                revert("Invalid character in number");
            }
        }

        // Scale up remaining decimal places to match SCALING_FACTOR
        while (decimals < maxDecimals) {
            result = result * 10;
            decimals++;
        }

        if (negative) {
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

    // Debug function to check latitudes and longitudes
    function getContractLocation()
        external
        view
        returns (int256 lat, int256 long)
    {
        return (latitude, longitude);
    }

    /**
     * @notice Calculates the distance between the contract's location and a user's location
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @return Distance in meters as a fixed-point number with 18 decimal places
     */
    function getDistanceFromContract(
        int256 userLat,
        int256 userLong
    ) public view returns (int256) {
        // Use the LatLonDistance library to calculate the distance
        return
            LatLonDistance.distance(
                latitude, // contract latitude
                longitude, // contract longitude
                userLat, // user latitude
                userLong // user longitude
            );
    }

    /**
     * @notice Checks if a user's location is within a specified distance from the contract
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @param maxDistanceMeters Maximum allowed distance in meters (18 decimal places)
     * @return True if user is within the specified distance, false otherwise
     */
    function isWithinRangeOfContract(
        int256 userLat,
        int256 userLong,
        int256 maxDistanceMeters
    ) public view returns (bool) {
        int256 distance = getDistanceFromContract(userLat, userLong);
        return distance <= maxDistanceMeters;
    }

    /**
     * @notice Returns both the distance and whether the user is within range in a single call
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @param maxDistanceMeters Maximum allowed distance in meters (18 decimal places)
     * @return distance Distance in meters as a fixed-point number with 18 decimal places
     * @return withinRange True if user is within the specified distance, false otherwise
     */
    function checkDistanceAndRange(
        int256 userLat,
        int256 userLong,
        int256 maxDistanceMeters
    ) external view returns (int256 distance, bool withinRange) {
        distance = getDistanceFromContract(userLat, userLong);
        withinRange = distance <= maxDistanceMeters;
        return (distance, withinRange);
    }
}
