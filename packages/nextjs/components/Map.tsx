import { SyntheticEvent } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { HomebaseMap } from "./homebase-map/HomebaseMap";
import { UserAlignedLocations } from "./homebase-map/UserAlignedLocations";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
import { useGetUserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { useLocationScores } from "~~/hooks/homebase-map/useLocationScores";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { locations } from "~~/locations.config";

export function Map() {
  const mapHeight = useMapHeight(450, 650);

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  const { userLocation, center } = useGetUserLocation();

  const { address: connectedAddress } = useAccount();

  const { selectedMarker } = useSelectedMarker();

  const { locationScores } = useLocationScores();

  // const { data: alignmentCost } = useScaffoldReadContract({
  //   contractName: "AlignmentManagerV1",
  //   functionName: "getAlignmentCost",
  // });

  const { data: isUserAlignedWithEntity } = useScaffoldReadContract({
    contractName: "AlignmentV1",
    functionName: "getUserAlignmentWithEntity",
    args: [selectedMarker?.address, connectedAddress],
  });

  const { handleSubmit: attestLocation } = useAttestLocation({ userLocation });

  async function pledge(event: SyntheticEvent) {
    event.preventDefault();

    await attestLocation();
  }

  return (
    <>
      <LoadingOverlay message="Where is your Homebase?" duration={1000} />
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
                </>
              ) : (
                <>
                  <button className="btn btn-primary btn-sm" onClick={pledge}>
                    {"Attest Location"}
                  </button>
                </>
              ))}
          </div>
        }
      />

      <UserAlignedLocations />
    </>
  );
}
