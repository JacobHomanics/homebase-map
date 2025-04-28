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

contract LocationPeriphery is AccessControl {
    using DistanceUtils for int256;

    bytes32 public immutable SCHEMA_UID;
    IEAS public immutable eas;

    int256[2] public s_coordinates;

    constructor(
        address[] memory admins,
        int256 _latitude,
        int256 _longitude,
        address _eas,
        bytes32 _schemaUID
    ) {
        s_coordinates[0] = _latitude; // latitude
        s_coordinates[1] = _longitude; // longitude

        eas = IEAS(_eas);
        SCHEMA_UID = _schemaUID;

        for (uint256 i = 0; i < admins.length; i++) {
            _grantRole(DEFAULT_ADMIN_ROLE, admins[i]);
        }
    }

    function _basicAttestationChecks(
        IEAS.Attestation memory attestation
    ) internal view {
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
    }

    function verifyLocation(
        bytes32 attestationUID
    ) external view returns (bool) {
        // Get the attestation
        IEAS.Attestation memory attestation = eas.getAttestation(
            attestationUID
        );

        _basicAttestationChecks(attestation);

        // Decode the attestation data
        (int256 attestationLatitude, int256 attestationLongitude) = abi.decode(
            attestation.data,
            (int256, int256)
        );

        bool isInBboxInMeters = isInBoundingBoxInMeters(
            attestationLatitude,
            attestationLongitude,
            56000,
            s_coordinates[0],
            s_coordinates[1]
        );

        bool isInBboxInDegrees = isInBoundingBoxInDegrees(
            attestationLatitude,
            attestationLongitude,
            5,
            s_coordinates[0],
            s_coordinates[1]
        );

        return isInBboxInMeters || isInBboxInDegrees;
    }

    function isInBoundingBox(
        int256 latitude,
        int256 longitude,
        int256 bufferLat,
        int256 bufferLong,
        int256 boxLat,
        int256 boxLong
    ) public pure returns (bool) {
        int256[2][2] memory bbox;

        // Lower left
        bbox[0][0] = boxLat - bufferLat;
        bbox[0][1] = boxLong - bufferLong;
        // Upper right
        bbox[1][0] = boxLat + bufferLat;
        bbox[1][1] = boxLong + bufferLong;

        bool isInBbox = latitude > bbox[0][0] &&
            latitude < bbox[1][0] &&
            longitude > bbox[0][1] &&
            longitude < bbox[1][1];

        return isInBbox;
    }

    function isInBoundingBoxInDegrees(
        int256 latitude,
        int256 longitude,
        int256 bufferInDegrees,
        int256 boxLat,
        int256 boxLong
    ) public pure returns (bool) {
        return
            isInBoundingBox(
                latitude,
                longitude,
                bufferInDegrees,
                bufferInDegrees,
                boxLat,
                boxLong
            );
    }

    function isInBoundingBoxInMeters(
        int256 latitude,
        int256 longitude,
        int256 bufferInMeters,
        int256 boxLat,
        int256 boxLong
    ) public pure returns (bool) {
        int256 bufferLatNanodegrees = metersToNanodegreesLatitude(
            bufferInMeters
        );
        int256 bufferLonNanodegrees = metersToNanodegreesLongitude(
            bufferInMeters,
            boxLat
        );

        return
            isInBoundingBox(
                latitude,
                longitude,
                bufferLatNanodegrees,
                bufferLonNanodegrees,
                boxLat,
                boxLong
            );
    }

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
