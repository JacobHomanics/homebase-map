import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { EASContext } from "./EASContextProvider";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import { ethers } from "ethers";
// import { formatEther } from "viem";
import { getAddress } from "viem";
import { Config, UseChainIdParameters, useAccount, useChainId } from "wagmi";
import easConfig from "~~/EAS.config";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Location, locations } from "~~/locations.config";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

interface UserLocation {
  lat: number;
  lng: number;
}

const defaultCenter = {
  lat: 39.78597,
  lng: -101.58847,
};

export function Map() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [center, setCenter] = useState(defaultCenter);

  const mapHeight = useMapHeight(450, 650);

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  useEffect(() => {
    console.log("Attempting to get geolocation...");

    if ("geolocation" in navigator) {
      // Add loading state while waiting for geolocation
      const timeoutId = setTimeout(() => {
        console.log("Geolocation request timed out");
        // If geolocation takes too long, use default center
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        position => {
          clearTimeout(timeoutId);
          console.log("Position successfully obtained:", position);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setCenter(newLocation);
        },
        error => {
          clearTimeout(timeoutId);
          console.error("Error getting location:", error);
          // Set default location if there's an error
          setUserLocation(defaultCenter);

          // Handle specific error codes
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("User denied the request for geolocation");
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("Location information is unavailable");
              break;
            case error.TIMEOUT:
              console.log("The request to get user location timed out");
              break;
            default:
              console.log("An unknown error occurred");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        },
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Set default location if geolocation is not supported
      setUserLocation(defaultCenter);
    }
  }, []);

  console.log("userLocation", userLocation);

  const { address: connectedAddress } = useAccount();

  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);

  const { data: userAlignedLocations, refetch: refetchUserAlignedLocations } = useScaffoldReadContract({
    contractName: "AlignmentManagerV1",
    functionName: "getUserAlignments",
    args: [connectedAddress],
  });

  // const { data: alignmentCost } = useScaffoldReadContract({
  //   contractName: "AlignmentManagerV1",
  //   functionName: "getAlignmentCost",
  // });

  const [locationScores, setLocationScores] = useState<{ [key: string]: number }>({});

  const { data: alignmentManager } = useScaffoldContract({
    contractName: "AlignmentManagerV1",
  });

  const fetchLocationScores = async () => {
    if (!alignmentManager) return;

    const scores: { [key: string]: number } = {};
    for (const location of locations) {
      const score = await alignmentManager.read.getEntityAlignmentScore([getAddress(location.address)]);
      scores[location.address] = Number(score);
    }
    setLocationScores(scores);
  };

  useEffect(
    () => {
      fetchLocationScores();
    },
    // eslint-disable-next-line
    [alignmentManager?.address],
  );

  const { data: isUserAlignedWithEntity, refetch: refetchIsUserAlignedWithEntity } = useScaffoldReadContract({
    contractName: "AlignmentV1",
    functionName: "getUserAlignmentWithEntity",
    args: [selectedMarker?.address, connectedAddress],
  });

  // const { writeContractAsync: writeAlignmentManagerAsync } = useScaffoldWriteContract("AlignmentManagerV1");

  const [error, setError] = useState<string | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(false);

  // Use EAS SDK
  const { eas, isReady } = useContext(EASContext); // does this need error handling in case EAS is null or not ready?
  // const [attestation, setAttestation] = useState<Attestation>();

  const chainId = useChainId(wagmiConfig as UseChainIdParameters<Config>);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(easConfig.schema.rawString);
  const schemaUID = easConfig.chains[chainId.toString() as keyof typeof easConfig.chains]?.schemaUID;

  const handleSubmit = async (event: SyntheticEvent) => {
    console.log("started");

    event.preventDefault();
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
      const longitude = userLocation ? userLocation.lng.toString() : "-9.3539";
      const latitude = userLocation ? userLocation.lat.toString() : "51.4747";
      const mediaLink = "<IPFS CID, or a URL>";
      const memo = "Your memo";

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

      console.log(newAttestationUID);
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

  return (
    <>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4} //options={{ styles: customMapStyle }}//
        >
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              title="Your Location"
            />
          )}

          {locations.map(marker => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker)} // Show InfoWindow on click
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)} // Close InfoWindow on click
            >
              <div className="p-4 text-center bg-base-300 m-4 rounded-lg items-center flex justify-center flex-col">
                <p className="m-0 text-xl md:text-4xl text-black dark:text-white">{selectedMarker.title}</p>
                <p className="m-0 text-2xl md:text-xl text-black dark:text-white">Pledges</p>{" "}
                <p className="m-0 text-2xl md:text-6xl text-black dark:text-white">
                  {locationScores[selectedMarker.address]}
                </p>
                {!connectedAddress && <ConnectButton />}
                {connectedAddress &&
                  (isUserAlignedWithEntity ? (
                    <>
                      <p className="text-green-600 text-2xl">You are Based with this Region!</p>
                      {/* <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          await writeAlignmentManagerAsync({
                            functionName: "removeAlignment",
                            args: [selectedMarker?.address],
                          });

                          await fetchLocationScores();
                          await refetchIsUserAlignedWithEntity();
                          await refetchUserAlignedLocations();
                        }}
                      >
                        {"Remove alignment"}
                      </button> */}
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary w-44 flex flex-col"
                        onClick={handleSubmit}
                        // onClick={async () => {
                        // try {
                        //   const res = await fetch("/api/pledge", {
                        //     method: "POST",
                        //     headers: {
                        //       "Content-Type": "application/json",
                        //     },
                        //     body: JSON.stringify({
                        //       userAddress: connectedAddress,
                        //       location: selectedMarker.address,
                        //       password: "Test",
                        //     }),
                        //   });

                        //   const data = await res.json();
                        //   if (res.ok) {
                        //     console.log(data.message);
                        //   } else {
                        //     console.error("Error pledging:", data.error);
                        //   }
                        // } catch (error) {
                        //   console.error("Error:", error);
                        // }

                        // await writeAlignmentManagerAsync({
                        //   functionName: "addAlignment",
                        //   args: [selectedMarker.address, connectedAddress],
                        // });

                        // await fetchLocationScores();
                        // await refetchIsUserAlignedWithEntity();
                        // await refetchUserAlignedLocations();
                        // }}
                      >
                        <p className="m-0 p-0">{`Checkin`}</p>
                        {/* <p className="m-0 p-0">{`(${formatEther(alignmentCost || BigInt(0))} ETH)`}</p> */}
                      </button>
                    </>
                  ))}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {userAlignedLocations && userAlignedLocations.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-10 bg-primary">
          <div>
            <p className="text-center">{"You are Based in: "}</p>

            <p className="text-center">
              {userAlignedLocations
                ?.map((location: any) => locations.find(marker => marker.address === location)?.title)
                .join(", ")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
