import { SyntheticEvent, useMemo } from "react";
import { LoadingOverlay } from "./LoadingOverlay";
import { HomebaseMap } from "./homebase-map/HomebaseMap";
import { UserAlignedLocations } from "./homebase-map/UserAlignedLocations";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
import { useGetUserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
// import { useLocationScores } from "~~/hooks/homebase-map/useLocationScores";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useTokenURI } from "~~/hooks/useTokenURI";
import { Location, locations } from "~~/locations.config";
import { DEFAULT_RANGE_METERS, isWithinRange } from "~~/utils/distance";

export function Map() {
  const mapHeight = useMapHeight(450, 650);

  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };

  // const { userLocation, center } = useGetUserLocation();

  const userLocation = { lat: -3.3816595330236003, lng: 36.701730603710025 };
  const center = { lat: 50.84364262516137, lng: 4.403013511221624 };
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

  const { data: brusselsTotalSupply } = useScaffoldReadContract({
    contractName: "Brussels",
    functionName: "totalSupply",
  });

  const { data: goshoTotalSupply } = useScaffoldReadContract({
    contractName: "Gosho",
    functionName: "totalSupply",
  });

  const { data: yogyakartaTotalSupply } = useScaffoldReadContract({
    contractName: "Yogyakarta",
    functionName: "totalSupply",
  });

  const { data: ndotohubTotalSupply } = useScaffoldReadContract({
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
    const newAttestationUID = await attestLocation({ userLocation: userLocation ?? { lat: 0, lng: 0 } });
    console.log("newAttestationUID");
    console.log(newAttestationUID);

    if (newAttestationUID !== undefined) {
      await nftWriteMapping[selectedMarker?.id ?? 0]({
        functionName: "mint",
        args: [newAttestationUID as `0x${string}`],
      });
    }
  }

  return (
    <>
      <LoadingOverlay message="Where is your Homebase?" duration={1000} />
      <HomebaseMap
        userLocation={userLocation}
        center={center}
        locations={locations}
        containerStyle={mapContainerStyle}
        infoWindowChildren={(location: Location) => (
          <div className="p-4 text-center bg-base-300 m-4 rounded-lg items-center flex justify-center flex-col">
            <p className="m-0 text-xl text-black dark:text-white">{location.title}</p>
            <p className="m-0 text-2xl md:text-xl text-black dark:text-white">Pledges</p>{" "}
            <p className="m-0 text-2xl md:text-6xl text-black dark:text-white">{nftTotalSupplyMapping[location.id]}</p>
            {/* {!isLocationInRange(location) && <p className="text-red-500">This location is outside your range</p>} */}
            {!connectedAddress && <ConnectButton />}
            {connectedAddress &&
              ((nftBalanceMapping?.[location.id] ?? 0) > 0 ? (
                <>
                  <p className="text-green-600 text-2xl">You are Based with this Region!</p>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={pledge} //disabled={!isLocationInRange(location)}
                  >
                    {
                      //!isLocationInRange(location) ? "Location Out of Range" :
                      "Check in"
                    }
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
