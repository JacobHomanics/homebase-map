// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library GeoDistance {
    int256 private constant R = 6371000 * 1e6; // Earth's radius in meters * 1e6 for fixed-point

    // All inputs and outputs are in degrees scaled by 1e6 (e.g., 45.123456° => 45123456)
    function distance(
        int256 lat1,
        int256 lon1,
        int256 lat2,
        int256 lon2
    ) internal pure returns (int256) {
        int256 scale = 1e6;

        int256 x = (lon2 - lon1) * cos((lat1 + lat2) / 2);
        int256 y = (lat2 - lat1);

        // Pythagorean approximation of distance
        int256 dist = sqrt((x * x + y * y) / (scale * scale));
        return (R * dist) / scale;
    }

    // Approximate cosine using Taylor series around 0: cos(x) ≈ 1 - x²/2 for small x
    function cos(int256 lat) internal pure returns (int256) {
        // Convert from degrees * 1e6 to radians * 1e6
        int256 pi = 3141592; // pi scaled by 1e6
        int256 rad = (lat * pi) / (180 * 1e6);

        // cos(x) ≈ 1 - x² / 2 for small x
        int256 radSq = (rad * rad) / 1e6;
        return 1e6 - (radSq / 2);
    }

    // Babylonian method sqrt
    function sqrt(int256 x) internal pure returns (int256) {
        if (x == 0) return 0;
        int256 z = (x + 1) / 2;
        int256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
