//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {PRBMathSD59x18 as P} from "prb-math/PRBMathSD59x18.sol";
import {PRBMath as P2} from "prb-math/PRBMath.sol";
import {Arcsin as A} from "solidity-trigonometry/Arcsin.sol";
import {Trigonometry as T} from "solidity-trigonometry/Trigonometry.sol";

/**
 * @notice Calculates distance (in meters) between two locations by
 * approximating the earth as a sphere and using the great sphere distance
 * formula. See the python implementation on
 * https://www.vibhuagrawal.com/blog/geospatial-nearest-neighbor-search.
 *
 * Tests with a relative tolerance of 0.05%, with the smallest tested distance
 * being 1.112 km.
 *
 * @author Md Abid Sikder
 */
library LatLonDistance {
    using P for int256;

    /**
     * @notice IUGG mean radius R_1 = 6371008.7714 meters, with 18 decimal
     * points. See DOI: 10.1007/BF02521480 for the original paper source.
     */
    int256 constant earthRadius = 6371008771400000000000000;

    int256 constant maxLat = 90000000000000000000;
    int256 constant minLat = -90000000000000000000;
    int256 constant maxLon = 180000000000000000000;
    int256 constant minLon = -180000000000000000000;

    modifier validLat(int256 _lat) {
        require(_lat <= maxLat, "Latitude too big");
        require(_lat >= minLat, "Latitude too small");
        _;
    }

    modifier validLon(int256 _lon) {
        require(_lon <= maxLon, "Longitude too big");
        require(_lon >= minLon, "Longitude too small");
        _;
    }

    /**
     * @dev Only for internal library use. Multiplies by pi and divides by 180.
     */
    function mpd1(int256 _x) internal pure returns (int256) {
        int256 c180 = 180000000000000000000;
        return P2.mulDivSigned(_x, P.pi(), c180);
    }

    /**
     * @notice Auxiliary function for use by library.
     * @dev Calculates $\sin^2(\frac{lat_2 - lat_1}{2})$
     */
    function aux1(int256 lat1, int256 lat2) internal pure returns (int256) {
        int256 TWO = 2000000000000000000;

        int256 delta = lat2 - lat1;

        uint256 sinArg = uint256(delta.div(TWO).abs());
        int256 sinOut = T.sin(sinArg);

        int256 sinSq = sinOut.mul(sinOut);

        return sinSq;
    }

    /**
     * @notice Auxiliary function for use by library.
     * @dev Calculates $\cos(lat_1) \cdot \cos(lat_2)$
     */
    function aux2(int256 lat1, int256 lat2) internal pure returns (int256) {
        // cos(-x) = cos(x), so taking the absolute value will not change the result
        uint256 l1 = uint256(lat1.abs());
        uint256 l2 = uint256(lat2.abs());

        int256 cosProd = T.cos(l1).mul(T.cos(l2));

        return cosProd;
    }

    /**
     * @notice Auxiliary function for use by library.
     * @dev Calculates $\sin^2(\frac{lon_2 - lon_1}{2})$
     */
    function aux3(int256 lon1, int256 lon2) internal pure returns (int256) {
        int256 TWO = 2000000000000000000;

        // Since we square the result of the sine, ignore the sign of the argument
        int256 delta = (lon2 - lon1);

        // take the absolute value before casting to uint256 to prevent issues with
        // the first two's complement bit blowing up the size
        uint256 sinArg = uint256(delta.div(TWO).abs());

        int256 sinOut = T.sin(sinArg);
        int256 sinSq = sinOut.mul(sinOut);

        return sinSq;
    }

    /**
     * @notice Calculates distance between two latitude longitude points, by
     * approximating the earth as a sphere and taking the shortest great circle
     * distance.
     *
     * All parameters must be given in terms of degrees and as fixed-width
     * decimal integers, with 18 decimal points.
     *
     * @param _lat1 Point 1 Latitude
     * @param _lon1 Point 1 Longitude
     * @param _lat2 Point 2 Latitude
     * @param _lon2 Point 2 Longitude
     *
     * @return Distance as an integer with 18 fixed-width decimal points.
     */
    function distance(
        int256 _lat1,
        int256 _lon1,
        int256 _lat2,
        int256 _lon2
    )
        internal
        pure
        validLat(_lat1)
        validLat(_lat2)
        validLon(_lon1)
        validLon(_lon2)
        returns (int256)
    {
        int256 TWO = 2000000000000000000;

        // convert to radian measure
        _lat1 = mpd1(_lat1);
        _lat2 = mpd1(_lat2);
        _lon1 = mpd1(_lon1);
        _lon2 = mpd1(_lon2);

        // split up computation to avoid "Stack Too Deep" errors
        int256 a1 = aux1(_lat1, _lat2);
        int256 a2 = aux2(_lat1, _lat2);
        int256 a3 = aux3(_lon1, _lon2);

        int256 a4 = a1 + a2.mul(a3);
        int256 a5 = a4.sqrt();

        int256 a6 = A.arcsin(a5);

        int256 result = a6.mul(earthRadius).mul(TWO);

        return result;
    }
}
