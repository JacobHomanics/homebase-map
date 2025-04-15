export type EASConfig = {
  schema: object;
  chains: object;
};

const easConfig = {
  schema: {
    interface: {
      lat: "int256",
      lng: "int256",
    },
    rawString: "int256 lat, int256 lng",
  },
  chains: {
    "42220": {
      chain: "celo",
      easContractAddress: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
      schemaUID: "0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b",
    },
    "42161": {
      chain: "arbitrum",
      easContractAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
      schemaUID: "0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b",
    },
    "11155111": {
      chain: "sepolia",
      easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
      schemaUID: "0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b",
    },
    "1": {
      chain: "mainnet",
      easContractAddress: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
      schemaUID: null,
    },
    "8453": {
      chain: "base",
      easContractAddress: "0x4200000000000000000000000000000000000021",
      schemaUID: "0xd665d417263da788c9ec676caeb9f7a82c8824556107a3720c4c34037658129b",
    },
  },
} as const satisfies EASConfig;

export default easConfig;
