import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { EASContext } from "./EASContextProvider";
import { HomebaseMap } from "./homebase-map/HomebaseMap";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import { ethers } from "ethers";
// import { formatEther } from "viem";
import { getAddress } from "viem";
import { Config, UseChainIdParameters, useAccount, useChainId } from "wagmi";
import easConfig from "~~/EAS.config";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
import { useGetUserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Location, locations } from "~~/locations.config";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export function Map() {
  // const [center, setCenter] = useState(defaultCenter);

  const mapHeight = useMapHeight(450, 650);

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  const { userLocation, center } = useGetUserLocation();

  const { address: connectedAddress } = useAccount();

  const { selectedMarker } = useSelectedMarker();

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

  const { handleSubmit: attestLocation } = useAttestLocation({ userLocation });

  console.log(selectedMarker);
  return (
    <>
      <HomebaseMap
        userLocation={userLocation}
        center={center}
        locations={locations}
        containerStyle={mapContainerStyle}
        infoWindowChildren={
          <div className="p-4 text-center bg-base-300 m-4 rounded-lg items-center flex justify-center flex-col">
            <p className="m-0 text-xl md:text-4xl text-black dark:text-white">
              {selectedMarker && selectedMarker.title}
            </p>
            <p className="m-0 text-2xl md:text-xl text-black dark:text-white">Pledges</p>{" "}
            <p className="m-0 text-2xl md:text-6xl text-black dark:text-white">
              {selectedMarker && locationScores[selectedMarker.address]}
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
                  <button className="btn btn-primary btn-sm" onClick={attestLocation}>
                    {"Attest Location"}
                  </button>
                </>
              ))}
          </div>
        }
      />
      {/* <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4} 
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
              onClick={() => setSelectedMarker(marker)} 
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
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
                  
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={attestLocation}>
                        {"Attest Location"}
                      </button>
                    </>
                  ))}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript> */}

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
