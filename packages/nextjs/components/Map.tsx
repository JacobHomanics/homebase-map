import { SyntheticEvent, useState } from "react";
import Image from "next/image";
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

  // Add totalSupply for new events
  const { data: swabiTotalSupply, refetch: refetchSwabiTotalSupply } = useScaffoldReadContract({
    contractName: "Swabi",
    functionName: "totalSupply",
  });

  const { data: camarinesTotalSupply, refetch: refetchCamarinesTotalSupply } = useScaffoldReadContract({
    contractName: "Camarines",
    functionName: "totalSupply",
  });

  const { data: puneTotalSupply, refetch: refetchPuneTotalSupply } = useScaffoldReadContract({
    contractName: "Pune",
    functionName: "totalSupply",
  });

  const { data: nairobiTotalSupply, refetch: refetchNairobiTotalSupply } = useScaffoldReadContract({
    contractName: "Nairobi",
    functionName: "totalSupply",
  });

  const { data: hongKongTotalSupply, refetch: refetchHongKongTotalSupply } = useScaffoldReadContract({
    contractName: "HongKong",
    functionName: "totalSupply",
  });

  const { data: accraTotalSupply, refetch: refetchAccraTotalSupply } = useScaffoldReadContract({
    contractName: "Accra",
    functionName: "totalSupply",
  });

  const { data: cartagenaTotalSupply, refetch: refetchCartagenaTotalSupply } = useScaffoldReadContract({
    contractName: "Cartagena",
    functionName: "totalSupply",
  });

  const { data: daNangTotalSupply, refetch: refetchDaNangTotalSupply } = useScaffoldReadContract({
    contractName: "DaNang",
    functionName: "totalSupply",
  });

  const { data: mumbaiTotalSupply, refetch: refetchMumbaiTotalSupply } = useScaffoldReadContract({
    contractName: "Mumbai",
    functionName: "totalSupply",
  });

  const { data: bangaloreTotalSupply, refetch: refetchBangaloreTotalSupply } = useScaffoldReadContract({
    contractName: "Bangalore",
    functionName: "totalSupply",
  });

  const { data: newYorkCityTotalSupply, refetch: refetchNewYorkCityTotalSupply } = useScaffoldReadContract({
    contractName: "NewYorkCity",
    functionName: "totalSupply",
  });

  const { data: buenosAiresTotalSupply, refetch: refetchBuenosAiresTotalSupply } = useScaffoldReadContract({
    contractName: "BuenosAires",
    functionName: "totalSupply",
  });

  const { data: manilaTotalSupply, refetch: refetchManilaTotalSupply } = useScaffoldReadContract({
    contractName: "Manila",
    functionName: "totalSupply",
  });

  const { data: dubaiTotalSupply, refetch: refetchDubaiTotalSupply } = useScaffoldReadContract({
    contractName: "Dubai",
    functionName: "totalSupply",
  });

  const { data: darEsSalaamTotalSupply, refetch: refetchDarEsSalaamTotalSupply } = useScaffoldReadContract({
    contractName: "DarEsSalaam",
    functionName: "totalSupply",
  });

  const { data: kigaliTotalSupply, refetch: refetchKigaliTotalSupply } = useScaffoldReadContract({
    contractName: "Kigali",
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

  // Add balanceOf for new events
  const { data: swabiBalance } = useScaffoldReadContract({
    contractName: "Swabi",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: camarinesBalance } = useScaffoldReadContract({
    contractName: "Camarines",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: puneBalance } = useScaffoldReadContract({
    contractName: "Pune",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: nairobiBalance } = useScaffoldReadContract({
    contractName: "Nairobi",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: hongKongBalance } = useScaffoldReadContract({
    contractName: "HongKong",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: accraBalance } = useScaffoldReadContract({
    contractName: "Accra",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: cartagenaBalance } = useScaffoldReadContract({
    contractName: "Cartagena",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: daNangBalance } = useScaffoldReadContract({
    contractName: "DaNang",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: mumbaiBalance } = useScaffoldReadContract({
    contractName: "Mumbai",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: bangaloreBalance } = useScaffoldReadContract({
    contractName: "Bangalore",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: newYorkCityBalance } = useScaffoldReadContract({
    contractName: "NewYorkCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: buenosAiresBalance } = useScaffoldReadContract({
    contractName: "BuenosAires",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: manilaBalance } = useScaffoldReadContract({
    contractName: "Manila",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: dubaiBalance } = useScaffoldReadContract({
    contractName: "Dubai",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: darEsSalaamBalance } = useScaffoldReadContract({
    contractName: "DarEsSalaam",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: kigaliBalance } = useScaffoldReadContract({
    contractName: "Kigali",
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

  // Add tokenURI for new events
  const { data: swabiTokenURI } = useScaffoldReadContract({
    contractName: "Swabi",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: camarinesTokenURI } = useScaffoldReadContract({
    contractName: "Camarines",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: puneTokenURI } = useScaffoldReadContract({
    contractName: "Pune",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: nairobiTokenURI } = useScaffoldReadContract({
    contractName: "Nairobi",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: hongKongTokenURI } = useScaffoldReadContract({
    contractName: "HongKong",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: accraTokenURI } = useScaffoldReadContract({
    contractName: "Accra",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: cartagenaTokenURI } = useScaffoldReadContract({
    contractName: "Cartagena",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: daNangTokenURI } = useScaffoldReadContract({
    contractName: "DaNang",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: mumbaiTokenURI } = useScaffoldReadContract({
    contractName: "Mumbai",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: bangaloreTokenURI } = useScaffoldReadContract({
    contractName: "Bangalore",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: newYorkCityTokenURI } = useScaffoldReadContract({
    contractName: "NewYorkCity",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: buenosAiresTokenURI } = useScaffoldReadContract({
    contractName: "BuenosAires",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: manilaTokenURI } = useScaffoldReadContract({
    contractName: "Manila",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: dubaiTokenURI } = useScaffoldReadContract({
    contractName: "Dubai",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: darEsSalaamTokenURI } = useScaffoldReadContract({
    contractName: "DarEsSalaam",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const { data: kigaliTokenURI } = useScaffoldReadContract({
    contractName: "Kigali",
    functionName: "tokenURI",
    args: [BigInt(0)],
  });

  const brusselsTokenURIReplaced = brusselsTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const goshoTokenURIReplaced = goshoTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const yogyakartaTokenURIReplaced = yogyakartaTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const ndotohubTokenURIReplaced = ndotohubTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");

  // Add tokenURI replacements for new events
  const swabiTokenURIReplaced = swabiTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const camarinesTokenURIReplaced = camarinesTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const puneTokenURIReplaced = puneTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const nairobiTokenURIReplaced = nairobiTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const hongKongTokenURIReplaced = hongKongTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const accraTokenURIReplaced = accraTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const cartagenaTokenURIReplaced = cartagenaTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const daNangTokenURIReplaced = daNangTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const mumbaiTokenURIReplaced = mumbaiTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const bangaloreTokenURIReplaced = bangaloreTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const newYorkCityTokenURIReplaced = newYorkCityTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const buenosAiresTokenURIReplaced = buenosAiresTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const manilaTokenURIReplaced = manilaTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const dubaiTokenURIReplaced = dubaiTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const darEsSalaamTokenURIReplaced = darEsSalaamTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");
  const kigaliTokenURIReplaced = kigaliTokenURI?.replace("ipfs://", "https://ipfs.io/ipfs/");

  const { nft: brusselsNFT } = useTokenURI(brusselsTokenURIReplaced);
  const { nft: goshoNFT } = useTokenURI(goshoTokenURIReplaced);
  const { nft: yogyakartaNFT } = useTokenURI(yogyakartaTokenURIReplaced);
  const { nft: ndotohubNFT } = useTokenURI(ndotohubTokenURIReplaced);

  // Add NFT hooks for new events
  const { nft: swabiNFT } = useTokenURI(swabiTokenURIReplaced);
  const { nft: camarinesNFT } = useTokenURI(camarinesTokenURIReplaced);
  const { nft: puneNFT } = useTokenURI(puneTokenURIReplaced);
  const { nft: nairobiNFT } = useTokenURI(nairobiTokenURIReplaced);
  const { nft: hongKongNFT } = useTokenURI(hongKongTokenURIReplaced);
  const { nft: accraNFT } = useTokenURI(accraTokenURIReplaced);
  const { nft: cartagenaNFT } = useTokenURI(cartagenaTokenURIReplaced);
  const { nft: daNangNFT } = useTokenURI(daNangTokenURIReplaced);
  const { nft: mumbaiNFT } = useTokenURI(mumbaiTokenURIReplaced);
  const { nft: bangaloreNFT } = useTokenURI(bangaloreTokenURIReplaced);
  const { nft: newYorkCityNFT } = useTokenURI(newYorkCityTokenURIReplaced);
  const { nft: buenosAiresNFT } = useTokenURI(buenosAiresTokenURIReplaced);
  const { nft: manilaNFT } = useTokenURI(manilaTokenURIReplaced);
  const { nft: dubaiNFT } = useTokenURI(dubaiTokenURIReplaced);
  const { nft: darEsSalaamNFT } = useTokenURI(darEsSalaamTokenURIReplaced);
  const { nft: kigaliNFT } = useTokenURI(kigaliTokenURIReplaced);

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

  // Add image replacements for new events
  if (swabiNFT) {
    swabiNFT.image = swabiNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (camarinesNFT) {
    camarinesNFT.image = camarinesNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (puneNFT) {
    puneNFT.image = puneNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (nairobiNFT) {
    nairobiNFT.image = nairobiNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (hongKongNFT) {
    hongKongNFT.image = hongKongNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (accraNFT) {
    accraNFT.image = accraNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (cartagenaNFT) {
    cartagenaNFT.image = cartagenaNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (daNangNFT) {
    daNangNFT.image = daNangNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (mumbaiNFT) {
    mumbaiNFT.image = mumbaiNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (bangaloreNFT) {
    bangaloreNFT.image = bangaloreNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (newYorkCityNFT) {
    newYorkCityNFT.image = newYorkCityNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (buenosAiresNFT) {
    buenosAiresNFT.image = buenosAiresNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (manilaNFT) {
    manilaNFT.image = manilaNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (dubaiNFT) {
    dubaiNFT.image = dubaiNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (darEsSalaamNFT) {
    darEsSalaamNFT.image = darEsSalaamNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (kigaliNFT) {
    kigaliNFT.image = kigaliNFT?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  const { handleSubmit: attestLocation } = useAttestLocation();

  const { writeContractAsync: writeBrusselsAsync } = useScaffoldWriteContract({ contractName: "Brussels" });
  const { writeContractAsync: writeGoshoAsync } = useScaffoldWriteContract({ contractName: "Gosho" });
  const { writeContractAsync: writeYogyakartaAsync } = useScaffoldWriteContract({ contractName: "Yogyakarta" });
  const { writeContractAsync: writeNdotohubAsync } = useScaffoldWriteContract({ contractName: "Ndotohub" });

  // Add write contract hooks for new events
  const { writeContractAsync: writeSwabiAsync } = useScaffoldWriteContract({ contractName: "Swabi" });
  const { writeContractAsync: writeCamarinesAsync } = useScaffoldWriteContract({ contractName: "Camarines" });
  const { writeContractAsync: writePuneAsync } = useScaffoldWriteContract({ contractName: "Pune" });
  const { writeContractAsync: writeNairobiAsync } = useScaffoldWriteContract({ contractName: "Nairobi" });
  const { writeContractAsync: writeHongKongAsync } = useScaffoldWriteContract({ contractName: "HongKong" });
  const { writeContractAsync: writeAccraAsync } = useScaffoldWriteContract({ contractName: "Accra" });
  const { writeContractAsync: writeCartagenaAsync } = useScaffoldWriteContract({ contractName: "Cartagena" });
  const { writeContractAsync: writeDaNangAsync } = useScaffoldWriteContract({ contractName: "DaNang" });
  const { writeContractAsync: writeMumbaiAsync } = useScaffoldWriteContract({ contractName: "Mumbai" });
  const { writeContractAsync: writeBangaloreAsync } = useScaffoldWriteContract({ contractName: "Bangalore" });
  const { writeContractAsync: writeNewYorkCityAsync } = useScaffoldWriteContract({ contractName: "NewYorkCity" });
  const { writeContractAsync: writeBuenosAiresAsync } = useScaffoldWriteContract({ contractName: "BuenosAires" });
  const { writeContractAsync: writeManilaAsync } = useScaffoldWriteContract({ contractName: "Manila" });
  const { writeContractAsync: writeDubaiAsync } = useScaffoldWriteContract({ contractName: "Dubai" });
  const { writeContractAsync: writeDarEsSalaamAsync } = useScaffoldWriteContract({ contractName: "DarEsSalaam" });
  const { writeContractAsync: writeKigaliAsync } = useScaffoldWriteContract({ contractName: "Kigali" });

  const nftWriteMapping = [
    writeBrusselsAsync,
    writeGoshoAsync,
    writeYogyakartaAsync,
    writeNdotohubAsync,
    writeSwabiAsync,
    writeCamarinesAsync,
    writePuneAsync,
    writeNairobiAsync,
    writeHongKongAsync,
    writeAccraAsync,
    writeCartagenaAsync,
    writeDaNangAsync,
    writeMumbaiAsync,
    writeBangaloreAsync,
    writeNewYorkCityAsync,
    writeBuenosAiresAsync,
    writeManilaAsync,
    writeDubaiAsync,
    writeDarEsSalaamAsync,
    writeKigaliAsync,
  ];

  const nftBalanceMapping = [
    brusselsBalance,
    goshoBalance,
    yogyakartaBalance,
    ndotohubBalance,
    swabiBalance,
    camarinesBalance,
    puneBalance,
    nairobiBalance,
    hongKongBalance,
    accraBalance,
    cartagenaBalance,
    daNangBalance,
    mumbaiBalance,
    bangaloreBalance,
    newYorkCityBalance,
    buenosAiresBalance,
    manilaBalance,
    dubaiBalance,
    darEsSalaamBalance,
    kigaliBalance,
  ];

  const nftTotalSupplyMapping = [
    brusselsTotalSupply,
    goshoTotalSupply,
    yogyakartaTotalSupply,
    ndotohubTotalSupply,
    swabiTotalSupply,
    camarinesTotalSupply,
    puneTotalSupply,
    nairobiTotalSupply,
    hongKongTotalSupply,
    accraTotalSupply,
    cartagenaTotalSupply,
    daNangTotalSupply,
    mumbaiTotalSupply,
    bangaloreTotalSupply,
    newYorkCityTotalSupply,
    buenosAiresTotalSupply,
    manilaTotalSupply,
    dubaiTotalSupply,
    darEsSalaamTotalSupply,
    kigaliTotalSupply,
  ];

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

    // Refetch totalSupply for all events
    refetchBrusselsTotalSupply();
    refetchGoshoTotalSupply();
    refetchYogyakartaTotalSupply();
    refetchNdotohubTotalSupply();
    refetchSwabiTotalSupply();
    refetchCamarinesTotalSupply();
    refetchPuneTotalSupply();
    refetchNairobiTotalSupply();
    refetchHongKongTotalSupply();
    refetchAccraTotalSupply();
    refetchCartagenaTotalSupply();
    refetchDaNangTotalSupply();
    refetchMumbaiTotalSupply();
    refetchBangaloreTotalSupply();
    refetchNewYorkCityTotalSupply();
    refetchBuenosAiresTotalSupply();
    refetchManilaTotalSupply();
    refetchDubaiTotalSupply();
    refetchDarEsSalaamTotalSupply();
    refetchKigaliTotalSupply();
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
            <Image
              width={200}
              height={200}
              className="w-48 h-32 object-cover rounded-lg mb-3"
              src={location.image || "/homebase.jpg"}
              alt={location.title}
            />
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
