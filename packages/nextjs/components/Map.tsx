import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
// import { formatEther } from "viem";
// import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Location, locations } from "~~/locations.config";

const center = {
  lat: 39.78597, // Latitude of your map center
  lng: -101.58847, // Longitude of your map center
};

export function Map() {
  const [mapHeight, setMapHeight] = useState(650);

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  useEffect(() => {
    const handleResize = () => {
      // Check if window width is less than typical mobile breakpoint (768px)
      setMapHeight(window.innerWidth < 768 ? 450 : 650);
    };

    // Set initial height
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    // for (const location of locations) {
    //   const score = await alignmentManager.read.getEntityAlignmentScore([getAddress(location.address)]);
    //   scores[location.address] = Number(score);
    // }
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

  return (
    <>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={4} //options={{ styles: customMapStyle }}//
        >
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
                        onClick={async () => {
                          // await writeAlignmentManagerAsync({
                          //   functionName: "addAlignment",
                          //   args: [selectedMarker.address, connectedAddress],
                          // });

                          await fetchLocationScores();
                          await refetchIsUserAlignedWithEntity();
                          await refetchUserAlignedLocations();
                        }}
                      >
                        <p className="m-0 p-0">{`Get Based`}</p>
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
