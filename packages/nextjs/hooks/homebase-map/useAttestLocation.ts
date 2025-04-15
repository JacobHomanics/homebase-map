import { useState } from "react";
import { useContext } from "react";
import { SyntheticEvent } from "react";
import { EASContext } from "../../components/EASContextProvider";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { Config, UseChainIdParameters, useChainId } from "wagmi";
import easConfig from "~~/EAS.config";
import { UserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const useAttestLocation = () => {
  const [error, setError] = useState<string | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Use EAS SDK
  const { eas, isReady } = useContext(EASContext); // does this need error handling in case EAS is null or not ready?
  // const [attestation, setAttestation] = useState<Attestation>();

  const chainId = useChainId(wagmiConfig as UseChainIdParameters<Config>);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(easConfig.schema.rawString);
  const schemaUID = easConfig.chains[chainId.toString() as keyof typeof easConfig.chains]?.schemaUID;

  const handleSubmit = async ({ lat, lng }: { lat: bigint; lng: bigint }) => {
    console.log("started");

    setIsTxLoading(true);
    setError(null);

    if (!isReady) {
      console.log("EAS is not ready");
      setError("EAS is not ready");
      setIsTxLoading(false);
      return;
    }

    if (!schemaUID) {
      console.log("Schema UID is null, cannot proceed with attestation");
      throw new Error("Schema UID is null, cannot proceed with attestation");
    }

    try {
      // Convert latitude and longitude to fixed-point representation (multiplied by 1e18)
      // const longitudeRaw = userLocation ? userLocation.lng.toString() : "-9.3539";
      // const latitudeRaw = userLocation ? userLocation.lat.toString() : "51.4747";

      // Convert to BigInt with 1e18 precision
      // const longitude = ethers.parseUnits(longitudeRaw, 9).toString();
      // const latitude = ethers.parseUnits(latitudeRaw, 9).toString();

      // const mediaLink = "<IPFS CID, or a URL>";
      // const memo = "Your memo";

      // Define encodeData function to structure the data for attestation
      const encodedData = schemaEncoder.encodeData([
        // { name: "eventTimestamp", value: Math.floor(Date.now() / 1000), type: "uint256" },
        // { name: "srs", value: "EPSG:4326", type: "string" },
        // { name: "locationType", value: "DecimalDegrees<string>", type: "string" },
        // { name: "location", value: `${longitude}, ${latitude}`, type: "string" },
        // { name: "recipeType", value: ["Type1", "Type2"], type: "string[]" },
        // { name: "recipePayload", value: [ethers.toUtf8Bytes("Payload1")], type: "bytes[]" },
        // { name: "mediaType", value: ["image/jpeg"], type: "string[]" },
        // { name: "mediaData", value: ["CID1", "CID2"], type: "string[]" },
        // { name: "memo", value: "Test memo", type: "string" },
        { name: "lat", value: lat, type: "int256" },
        { name: "lng", value: lng, type: "int256" },
      ]);

      const tx = await eas?.attest({
        schema: schemaUID,
        data: {
          recipient: easConfig.chains[String(chainId) as keyof typeof easConfig.chains].easContractAddress, // To be read by chainId: easConfig.chains[chainId].EAScontract;
          expirationTime: 0n,
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });

      const newAttestationUID = await tx?.wait();

      return newAttestationUID;
    } catch (err) {
      console.log(err);

      if (err instanceof Error) {
        setError((err.message as string) || "An error occurred while creating the attestation");
      } else {
        setError("An error occurred while creating the attestationm");
      }
    } finally {
      setIsTxLoading(false);
    }
  };

  return { handleSubmit };
};
