import { SyntheticEvent, useState } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { HomebaseMap } from "./homebase-map/HomebaseMap";
import { UserAlignedLocations } from "./homebase-map/UserAlignedLocations";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
// import { useGetUserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
// import { useLocationScores } from "~~/hooks/homebase-map/useLocationScores";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenURI } from "~~/hooks/useTokenURI";
import { Location, locations } from "~~/locations.config";
import { DEFAULT_RANGE_METERS, isWithinRange } from "~~/utils/distance";

export function Map() {
  const mapHeight = useMapHeight(450, 650);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState({ lat: 39.78597, lng: -101.58847 });
  const [isManualMode, setIsManualMode] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  // Function to get user location when the button is clicked
  const requestUserLocation = () => {
    setShowLoadingOverlay(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setCenter(newLocation);
          setShowLoadingOverlay(false);
        },
        error => {
          console.error("Error getting location:", error);
          setShowLoadingOverlay(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        },
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setShowLoadingOverlay(false);
    }
  };

  // Function to manually set user location
  const setManualLocation = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setCenter(location);
  };

  // Toggle between automatic and manual location modes
  const toggleManualMode = () => {
    setIsManualMode(prev => !prev);
  };

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  // const userLocation = { lat: -3.3816595331, lng: 36.701730603 };
  // const center = { lat: 50.84364262516137, lng: 4.403013511221624 };
  const { address: connectedAddress } = useAccount();

  const { selectedMarker } = useSelectedMarker();

  // const { locationScores } = useLocationScores();

  // Calculate which locations are within range of the user's location
  let locationsInRange: number[] = [];

  if (userLocation) {
    locationsInRange = locations
      .filter(location =>
        isWithinRange(
          userLocation?.lat,
          userLocation?.lng,
          location.position.lat,
          location.position.lng,
          DEFAULT_RANGE_METERS,
        ),
      )
      .map(location => location.id);
  }

  const isLocationInRange = (location: Location) => {
    return locationsInRange.includes(location.id);
  };

  // const { data: alignmentCost } = useScaffoldReadContract({
  //   contractName: "AlignmentManagerV1",
  //   functionName: "getAlignmentCost",
  // });

  // const { data: isUserAlignedWithEntity } = useScaffoldReadContract({
  //   contractName: "AlignmentV1",
  //   functionName: "getUserAlignmentWithEntity",
  //   args: [selectedMarker?.address, connectedAddress],
  // });

  const { data: brusselsTotalSupply, refetch: refetchBrusselsTotalSupply } = useScaffoldReadContract({
    contractName: "Brussels",
    functionName: "totalSupply",
  });

  const { data: goshoTotalSupply, refetch: refetchGoshoTotalSupply } = useScaffoldReadContract({
    contractName: "Gosho",
    functionName: "totalSupply",
  });

  const { data: yogyakartaTotalSupply, refetch: refetchYogyakartaTotalSupply } = useScaffoldReadContract({
    contractName: "Yogyakarta",
    functionName: "totalSupply",
  });

  const { data: ndotohubTotalSupply, refetch: refetchNdotohubTotalSupply } = useScaffoldReadContract({
    contractName: "Ndotohub",
    functionName: "totalSupply",
  });

  const { data: brusselsBalance } = useScaffoldReadContract({
    contractName: "Brussels",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: goshoBalance } = useScaffoldReadContract({
    contractName: "Gosho",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: yogyakartaBalance } = useScaffoldReadContract({
    contractName: "Yogyakarta",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: ndotohubBalance } = useScaffoldReadContract({
    contractName: "Ndotohub",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: brusselsTokenURI } = useScaffoldReadContract({
    contractName: "Brussels",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: goshoTokenURI } = useScaffoldReadContract({
    contractName: "Gosho",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: yogyakartaTokenURI } = useScaffoldReadContract({
    contractName: "Yogyakarta",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: ndotohubTokenURI } = useScaffoldReadContract({
    contractName: "Ndotohub",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const brusselsTokenURIReplaced = brusselsTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const goshoTokenURIReplaced = goshoTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const yogyakartaTokenURIReplaced = yogyakartaTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const ndotohubTokenURIReplaced = ndotohubTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");

  const { nft: brusselsNFT } = useTokenURI(brusselsTokenURIReplaced);
  const { nft: goshoNFT } = useTokenURI(goshoTokenURIReplaced);
  const { nft: yogyakartaNFT } = useTokenURI(yogyakartaTokenURIReplaced);
  const { nft: ndotohubNFT } = useTokenURI(ndotohubTokenURIReplaced);

  if (brusselsNFT) {
    brusselsNFT.image = brusselsNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (goshoNFT) {
    goshoNFT.image = goshoNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (yogyakartaNFT) {
    yogyakartaNFT.image = yogyakartaNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (ndotohubNFT) {
    ndotohubNFT.image = ndotohubNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  const { handleSubmit: attestLocation } = useAttestLocation();

  const { writeContractAsync: writeBrusselsAsync } = useScaffoldWriteContract({ contractName: "Brussels" });
  const { writeContractAsync: writeGoshoAsync } = useScaffoldWriteContract({ contractName: "Gosho" });
  const { writeContractAsync: writeYogyakartaAsync } = useScaffoldWriteContract({ contractName: "Yogyakarta" });
  const { writeContractAsync: writeNdotohubAsync } = useScaffoldWriteContract({ contractName: "Ndotohub" });

  const nftWriteMapping = [writeBrusselsAsync, writeGoshoAsync, writeYogyakartaAsync, writeNdotohubAsync];
  const nftBalanceMapping = [brusselsBalance, goshoBalance, yogyakartaBalance, ndotohubBalance];
  const nftTotalSupplyMapping = [brusselsTotalSupply, goshoTotalSupply, yogyakartaTotalSupply, ndotohubTotalSupply];

  async function pledge(event: SyntheticEvent) {
    event.preventDefault();

    // console.log(selectedMarker);

    // const response = await fetch("/api/pledge", {
    //   method: "POST",
    //   body: JSON.stringify({ userAddress: connectedAddress, location: userLocation, locationId: selectedMarker?.id }),
    // });

    // console.log(response);

    // const data = await response.json();
    // console.log(data);
    // if (data.message === "Alignment succesfully added!") {
    // }

    // if (data.error === "You are not in range of this location") {
    //   console.error(data.error);
    // }

    console.log("userLocation");
    console.log(userLocation);

    // const longitude = parseUnits(userLocation.lng.toString(), 9);
    // const latitude = parseUnits(userLocation.lat.toString(), 9);

    const testLongitude = parseUnits(userLocation?.lng?.toString() ?? "0", 9);
    const testLatitude = parseUnits(userLocation?.lat?.toString() ?? "0", 9);

    const newAttestationUID = await attestLocation({ lat: testLatitude, lng: testLongitude });
    console.log("newAttestationUID");
    console.log(newAttestationUID);

    // position: { lat: 50822830042, lng: 4358665232 },
    // if (newAttestationUID !== undefined) {
    await nftWriteMapping[selectedMarker?.id ?? 0]({
      functionName: "mint",
      // args: [[testLatitude, testLongitude]],
      args: [newAttestationUID as `0x${string}`],
    });
    // }

    refetchBrusselsTotalSupply();
    refetchGoshoTotalSupply();
    refetchYogyakartaTotalSupply();
    refetchNdotohubTotalSupply();
  }

  // Handler for clicking on the map in manual mode
  const handleMapClick = (location: { lat: number; lng: number }) => {
    setManualLocation(location);
  };

  return (
    <>
      {showLoadingOverlay && <LoadingOverlay message="Finding your Homebase..." duration={5000} />}

      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center">
          <label className="cursor-pointer label">
            <span className="label-text mr-2">Manual Location</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isManualMode}
              onChange={toggleManualMode}
            />
          </label>
        </div>

        <div className="flex items-center gap-4">
          {isManualMode && (
            <div className="text-sm text-info">
              {userLocation
                ? `Current location: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                : "Click on the map to set your location"}
            </div>
          )}

          <button className="btn btn-primary" onClick={requestUserLocation} disabled={isManualMode}>
            {userLocation ? "Update My Location" : "Find My Location"}
          </button>
        </div>
      </div>

      <HomebaseMap
        userLocation={userLocation}
        center={center}
        locations={locations}
        containerStyle={mapContainerStyle}
        isManualMode={isManualMode}
        onMapClick={handleMapClick}
        infoWindowChildren={(location: Location) => (
          <div className="p-4 text-center bg-base-300 m-4 rounded-lg items-center flex justify-center flex-col">
            <p className="m-0 text-xl text-black dark:text-white">{location.title}</p>
            <p className="m-0 text-2xl md:text-xl text-black dark:text-white">Pledges</p>{" "}
            <p className="m-0 text-2xl md:text-6xl text-black dark:text-white">{nftTotalSupplyMapping[location.id]}</p>
            {/* {isManualMode && (
              <button className="btn btn-secondary btn-sm mt-2" onClick={() => setManualLocation(location.position)}>
                Set my location here
              </button>
            )} */}
            {!connectedAddress && <ConnectButton />}
            {connectedAddress &&
              ((nftBalanceMapping?.[location.id] ?? 0) > 0 ? (
                <>
                  <p className="text-green-600 text-2xl">You call this place your homebase!</p>
                </>
              ) : (
                <>
                  {!isLocationInRange(location) && <p className="text-red-500">This location is outside your range</p>}

                  <button className="btn btn-primary btn-sm" onClick={pledge} disabled={!isLocationInRange(location)}>
                    {!isLocationInRange(location) ? "Location Out of Range" : "Check in"}
                  </button>
                </>
              ))}
          </div>
        )}
      />

      <UserAlignedLocations />
    </>
  );
}
