//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

library LocationParser {
    // Helper function to parse location string
    function parseLocation(
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
        string memory firstCoord = trimSpaces(
            substring(_location, start, commaIndex - start)
        );
        string memory secondCoord = trimSpaces(
            substring(_location, commaIndex + 1, end - (commaIndex + 1))
        );

        // Parse the coordinates - expecting "longitude,latitude" format
        long = stringToInt(firstCoord);
        lat = stringToInt(secondCoord);

        return (lat, long);
    }

    // Helper function to trim spaces from a string
    function trimSpaces(
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
    function substring(
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
    function stringToInt(string memory _str) internal pure returns (int256) {
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
}
