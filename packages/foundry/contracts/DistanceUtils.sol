//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./LatLongDistance.sol";

library DistanceUtils {
    using LatLonDistance for int256;

    /**
     * @notice Calculates the distance between two geographical points
     * @param baseLat Base latitude in fixed-point format (18 decimal places)
     * @param baseLong Base longitude in fixed-point format (18 decimal places)
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @return Distance in meters as a fixed-point number with 18 decimal places
     */
    function getDistance(
        int256 baseLat,
        int256 baseLong,
        int256 userLat,
        int256 userLong
    ) internal pure returns (int256) {
        return LatLonDistance.distance(baseLat, baseLong, userLat, userLong);
    }

    /**
     * @notice Checks if a user's location is within a specified distance from the base location
     * @param baseLat Base latitude in fixed-point format (18 decimal places)
     * @param baseLong Base longitude in fixed-point format (18 decimal places)
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @param maxDistanceMeters Maximum allowed distance in meters (18 decimal places)
     * @return True if user is within the specified distance, false otherwise
     */
    function isWithinRange(
        int256 baseLat,
        int256 baseLong,
        int256 userLat,
        int256 userLong,
        int256 maxDistanceMeters
    ) internal pure returns (bool) {
        int256 distance = getDistance(baseLat, baseLong, userLat, userLong);
        return distance <= maxDistanceMeters;
    }

    /**
     * @notice Returns both the distance and whether the user is within range in a single call
     * @param baseLat Base latitude in fixed-point format (18 decimal places)
     * @param baseLong Base longitude in fixed-point format (18 decimal places)
     * @param userLat User's latitude in fixed-point format (18 decimal places)
     * @param userLong User's longitude in fixed-point format (18 decimal places)
     * @param maxDistanceMeters Maximum allowed distance in meters (18 decimal places)
     * @return distance Distance in meters as a fixed-point number with 18 decimal places
     * @return withinRange True if user is within the specified distance, false otherwise
     */
    function checkDistanceAndRange(
        int256 baseLat,
        int256 baseLong,
        int256 userLat,
        int256 userLong,
        int256 maxDistanceMeters
    ) internal pure returns (int256 distance, bool withinRange) {
        distance = getDistance(baseLat, baseLong, userLat, userLong);
        withinRange = distance <= maxDistanceMeters;
        return (distance, withinRange);
    }
}
