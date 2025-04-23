import easConfig from "../../../EAS.config";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export async function attestLocation(recipientAddress: string) {
  const rpcUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  // Instantiate EAS with the appropriate provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Create a signer from private key
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ATTESTATION_PRIVATE_KEY not found in environment variables");
  }
  const signer = new ethers.Wallet(privateKey, provider);

  const eas = new EAS(easConfig.chains["8453"].easContractAddress);
  // Connect EAS with the signer instead of provider
  eas.connect(signer);

  // Initialize SchemaEncoder with the raw schema string
  const schemaRawString = easConfig.schema.rawString;
  const schemaEncoder = new SchemaEncoder(schemaRawString);

  // Dynamic values are:
  const longitude = "-9.3539"; // decimal degrees, formatted as strings
  const latitude = "51.4747";

  // Define encodeData function to structure the data for attestation
  const encodedData = schemaEncoder.encodeData([
    { name: "eventTimestamp", value: Math.floor(Date.now() / 1000), type: "uint256" },
    { name: "srs", value: "EPSG:4326", type: "string" },
    { name: "locationType", value: "DecimalDegrees<string>", type: "string" },
    { name: "location", value: `${longitude}, ${latitude}`, type: "string" },
    { name: "recipeType", value: ["Type1", "Type2"], type: "string[]" },
    { name: "recipePayload", value: [ethers.toUtf8Bytes("Payload1")], type: "bytes[]" },
    { name: "mediaType", value: ["image/jpeg"], type: "string[]" },
    { name: "mediaData", value: ["CID1", "CID2"], type: "string[]" },
    { name: "memo", value: "Test memo", type: "string" },
  ]);

  // Attest using EAS
  const schemaUID = easConfig.chains["8453"].schemaUID; // Adjust for your chain ID
  const attestationTx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: recipientAddress, // Replace with recipient address
      expirationTime: 0n, // No expiration
      revocable: true,
      data: encodedData,
    },
  });

  const attestationResult = await attestationTx.wait();
  console.log(`Attestation complete with UID: ${attestationResult}`);
  return attestationResult;
}
