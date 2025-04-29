export const HOMEBASE_PROFILE_ADDRESS = "0x0AB9066308004147Ff2789d3b9DeFF0986ABcE25";

export const abi = [
  {
    type: "function",
    name: "getUrl",
    inputs: [{ name: "_address", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setUrl",
    inputs: [{ name: "_url", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
];
