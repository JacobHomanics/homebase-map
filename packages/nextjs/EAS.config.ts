export type EASConfig = {
  schema: object;
  chains: object;
};

const easConfig = {
  schema: {
    interface: {
      eventTimestamp: "uint256",
      srs: "string",
      locationType: "string",
      location: "string",
      recipeType: "string[]",
      recipePayload: "bytes[]",
      mediaType: "string[]",
      mediaData: "string[]",
      memo: "string",
    },
    rawString: "uint256 eventTimestamp,int256 lat,int256 lng",
  },
  chains: {
    "42220": {
      chain: "celo",
      easContractAddress: "0x72E1d8ccf5299fb36fEfD8CC4394B8ef7e98Af92",
      schemaUID: "0xba4171c92572b1e4f241d044c32cdf083be9fd946b8766977558ca6378c824e2",
    },
    "42161": {
      chain: "arbitrum",
      easContractAddress: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
      schemaUID: "0xba4171c92572b1e4f241d044c32cdf083be9fd946b8766977558ca6378c824e2",
    },
    "11155111": {
      chain: "sepolia",
      easContractAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
      schemaUID: "0xba4171c92572b1e4f241d044c32cdf083be9fd946b8766977558ca6378c824e2",
    },
    "1": {
      chain: "mainnet",
      easContractAddress: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
      schemaUID: null,
    },
    "8453": {
      chain: "base",
      easContractAddress: "0x4200000000000000000000000000000000000021",
      schemaUID: "0xc4d36724ce4643672ca70ff49c51f4c6d0a7e2036c90c9a2c07d5125714fb92d",
    },
  },
} as const satisfies EASConfig;

export default easConfig;
