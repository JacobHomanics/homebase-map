"use client";

import { SyntheticEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoadingOverlay } from "./LoadingOverlay";
import { HomebaseMap } from "./homebase-map/HomebaseMap";
import { UserAlignedLocations } from "./homebase-map/UserAlignedLocations";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alchemy, Network } from "alchemy-sdk";
import { getContractAddress, parseUnits, zeroAddress } from "viem";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
// import { useGetUserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
// import { useLocationScores } from "~~/hooks/homebase-map/useLocationScores";
import { useMapHeight } from "~~/hooks/homebase-map/useMapHeight";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth/useScaffoldEventHistory";
// import { useTokenURI } from "~~/hooks/useTokenURI";
import { Location, locations } from "~~/locations.config";
import { useGlobalState } from "~~/services/store/store";
import { HOMEBASE_PROFILE_ADDRESS, abi } from "~~/utils/homebase-profile";
import { ContractName } from "~~/utils/scaffold-eth/contract";

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API Key.
  network: Network.BASE_MAINNET, // Replace with your network.
};
const alchemy = new Alchemy(settings);

// const isSpoofingLocation = false;

// // Export the location finder function
// export const findMyLocation = () => {
//   if (isSpoofingLocation) {
//     window.dispatchEvent(
//       new CustomEvent("userLocationUpdated", {
//         detail: { lat: 40.7123013, lng: -74.0069899 },
//       }),
//     );
//   } else {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         position => {
//           const { latitude, longitude } = position.coords;
//           // Remove localStorage usage
//           // Dispatch a custom event with the location data
//           window.dispatchEvent(
//             new CustomEvent("userLocationUpdated", {
//               detail: { lat: latitude, lng: longitude },
//             }),
//           );
//         },
//         error => {
//           console.error("Error getting the location:", error);
//         },
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   }
// };

interface Attribute {
  trait_type: string;
  value: any;
}

function NFTHoldersList({ contractAddress }: { contractAddress: string }) {
  const [owners, setOwners] = useState<string[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);
  const [holderProfiles, setHolderProfiles] = useState<Record<string, any>>({});
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchOwners = async () => {
      if (!contractAddress) return;
      try {
        setIsLoadingOwners(true);
        const ownersData = await alchemy.nft.getOwnersForContract(contractAddress);
        setOwners(ownersData.owners);
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setIsLoadingOwners(false);
      }
    };

    fetchOwners();
  }, [contractAddress]);

  useEffect(() => {
    const fetchHolderProfiles = async () => {
      if (!owners.length) return;

      setIsLoadingProfiles(true);
      const profiles: Record<string, any> = {};

      for (const address of owners) {
        try {
          const ipfsUrl = await publicClient?.readContract({
            address: HOMEBASE_PROFILE_ADDRESS,
            abi,
            functionName: "getUrl",
            args: [address],
          });

          if (ipfsUrl && typeof ipfsUrl === "string") {
            const response = await fetch(ipfsUrl);
            if (response.ok) {
              const profileData = await response.json();
              profiles[address] = {
                username: profileData.username || "",
                bio: profileData.bio || "",
                skills: profileData.attributes?.find((attr: Attribute) => attr.trait_type === "Skills")?.value || [],
                profilePicture: profileData.profilePicture
                  ? `https://ipfs.io/ipfs/${profileData.profilePicture}`
                  : null,
                social: profileData.social || {},
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching profile for ${address}:`, error);
        }
      }

      setHolderProfiles(profiles);
      setIsLoadingProfiles(false);
    };

    fetchHolderProfiles();
  }, [owners, publicClient]);

  if (isLoadingOwners || isLoadingProfiles) {
    return <div className="text-center">Loading attendees...</div>;
  }

  const holderAddresses = Object.values(owners);
  const displayedHolders = holderAddresses
    .sort((a, b) => {
      const profileA = holderProfiles[a];
      const profileB = holderProfiles[b];

      // If both have profiles, sort by username
      if (profileA?.username && profileB?.username) {
        return profileA.username.localeCompare(profileB.username);
      }
      // If only one has a profile, put it first
      if (profileA?.username) return -1;
      if (profileB?.username) return 1;
      // If neither has a profile, maintain original order
      return 0;
    })
    .slice(0, displayCount);
  const hasMore = holderAddresses.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Attendees</h3>
      <div className="max-h-60 overflow-y-auto">
        {displayedHolders.map((holder: string, index: number) => {
          const profile = holderProfiles[holder];
          return (
            <div key={index} className="flex items-center space-x-2 p-2 hover:bg-base-200 rounded-lg w-[200px]">
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.username || "Profile"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {profile?.username || `${holder.slice(0, 6)}...${holder.slice(-4)}`}
                </div>
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="text-xs text-base-content/70 truncate">{profile.skills.join(" • ")}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button onClick={handleLoadMore} className="btn btn-sm btn-ghost mt-2 w-full">
          Load 5 More
        </button>
      )}
    </div>
  );
}

export function Map() {
  const mapHeight = useMapHeight(450, 650);

  const userLocation = useGlobalState(state => state.userLocation);

  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const center = userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 26.4160872, lng: 167.849134 };

  // const [center, setCenter] = useState(
  //   userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 26.4160872, lng: 167.849134 },
  // );
  // const [isManualMode, setIsManualMode] = useState(false);
  // const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  // We're keeping clusterRadius state because it's still used by the map, but hiding the UI control
  const [clusterRadius, setClusterRadius] = useState(15000); // Default 15km cluster radius
  const [focusedLocationFromCluster, setFocusedLocationFromCluster] = useState(false);
  const mapContainerStyle = {
    width: "100%",
    height: `${mapHeight}px`,
  };
  const { address: connectedAddress } = useAccount();
  const mapRef = useRef<any>(null);

  // Listen for the custom event instead of reading from localStorage
  // useEffect(() => {
  //   const handleLocationUpdate = async (event: any) => {
  //     const newLocation = event.detail;

  //     setUserLocation(newLocation);
  //     setCenter(newLocation);
  //     const testLongitude = parseUnits(newLocation.lng.toString(), 9);
  //     const testLatitude = parseUnits(newLocation.lat.toString(), 9);

  //     const newAttestationUID = await attestLocation({ lat: testLatitude, lng: testLongitude });
  //     console.log("newAttestationUID", newAttestationUID);
  //   };

  //   window.addEventListener("userLocationUpdated", handleLocationUpdate);

  //   return () => {
  //     window.removeEventListener("userLocationUpdated", handleLocationUpdate);
  //   };
  // }, []);

  const { selectedMarker } = useSelectedMarker();

  // const { locationScores } = useLocationScores();

  // Function to get user location when the button is clicked
  // const requestUserLocation = () => {
  //   setShowLoadingOverlay(true);

  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       position => {
  //         const newLocation = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         };
  //         setUserLocation(newLocation);
  //         setCenter(newLocation);
  //         setShowLoadingOverlay(false);
  //       },
  //       error => {
  //         console.error("Error getting location:", error);
  //         setShowLoadingOverlay(false);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         timeout: 8000,
  //         maximumAge: 0,
  //       },
  //     );
  //   } else {
  //     console.log("Geolocation is not supported by this browser.");
  //     setShowLoadingOverlay(false);
  //   }
  // };

  // const { data: brusselsTotalSupply, refetch: refetchBrusselsTotalSupply } = useScaffoldReadContract({
  //   contractName: "Brussels",
  //   functionName: "totalSupply",
  // });

  // const { data: goshoTotalSupply, refetch: refetchGoshoTotalSupply } = useScaffoldReadContract({
  //   contractName: "Gosho",
  //   functionName: "totalSupply",
  // });

  // const { data: yogyakartaTotalSupply, refetch: refetchYogyakartaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Yogyakarta",
  //   functionName: "totalSupply",
  // });

  // const { data: ndotohubTotalSupply, refetch: refetchNdotohubTotalSupply } = useScaffoldReadContract({
  //   contractName: "Ndotohub",
  //   functionName: "totalSupply",
  // });

  // // Add totalSupply for new events
  // const { data: swabiTotalSupply, refetch: refetchSwabiTotalSupply } = useScaffoldReadContract({
  //   contractName: "Swabi",
  //   functionName: "totalSupply",
  // });

  // const { data: camarinesTotalSupply, refetch: refetchCamarinesTotalSupply } = useScaffoldReadContract({
  //   contractName: "Camarines",
  //   functionName: "totalSupply",
  // });

  // const { data: puneTotalSupply, refetch: refetchPuneTotalSupply } = useScaffoldReadContract({
  //   contractName: "Pune",
  //   functionName: "totalSupply",
  // });

  // const { data: nairobiTotalSupply, refetch: refetchNairobiTotalSupply } = useScaffoldReadContract({
  //   contractName: "Nairobi",
  //   functionName: "totalSupply",
  // });

  // const { data: hongKongTotalSupply, refetch: refetchHongKongTotalSupply } = useScaffoldReadContract({
  //   contractName: "HongKong",
  //   functionName: "totalSupply",
  // });

  // const { data: cartagenaTotalSupply, refetch: refetchCartagenaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Cartagena",
  //   functionName: "totalSupply",
  // });

  // const { data: daNangTotalSupply, refetch: refetchDaNangTotalSupply } = useScaffoldReadContract({
  //   contractName: "DaNang",
  //   functionName: "totalSupply",
  // });

  // const { data: mumbaiTotalSupply, refetch: refetchMumbaiTotalSupply } = useScaffoldReadContract({
  //   contractName: "Mumbai",
  //   functionName: "totalSupply",
  // });

  // const { data: bangaloreTotalSupply, refetch: refetchBangaloreTotalSupply } = useScaffoldReadContract({
  //   contractName: "Bangalore",
  //   functionName: "totalSupply",
  // });

  // const { data: newYorkCityTotalSupply, refetch: refetchNewYorkCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "NewYorkCity",
  //   functionName: "totalSupply",
  // });

  // const { data: buenosAiresTotalSupply, refetch: refetchBuenosAiresTotalSupply } = useScaffoldReadContract({
  //   contractName: "BuenosAires",
  //   functionName: "totalSupply",
  // });

  // const { data: manilaTotalSupply, refetch: refetchManilaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Manila",
  //   functionName: "totalSupply",
  // });

  // const { data: dubaiTotalSupply, refetch: refetchDubaiTotalSupply } = useScaffoldReadContract({
  //   contractName: "Dubai",
  //   functionName: "totalSupply",
  // });

  // const { data: darEsSalaamTotalSupply, refetch: refetchDarEsSalaamTotalSupply } = useScaffoldReadContract({
  //   contractName: "DarEsSalaam",
  //   functionName: "totalSupply",
  // });

  // const { data: kigaliTotalSupply, refetch: refetchKigaliTotalSupply } = useScaffoldReadContract({
  //   contractName: "Kigali",
  //   functionName: "totalSupply",
  // });

  // // Add totalSupply for remaining events
  // const { data: abujaTotalSupply, refetch: refetchAbujaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Abuja",
  //   functionName: "totalSupply",
  // });

  // const { data: addisAbabaTotalSupply, refetch: refetchAddisAbabaTotalSupply } = useScaffoldReadContract({
  //   contractName: "AddisAbaba",
  //   functionName: "totalSupply",
  // });

  // const { data: angelesCityTotalSupply, refetch: refetchAngelesCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "AngelesCity",
  //   functionName: "totalSupply",
  // });

  // const { data: austinTotalSupply, refetch: refetchAustinTotalSupply } = useScaffoldReadContract({
  //   contractName: "Austin",
  //   functionName: "totalSupply",
  // });

  // const { data: balangaCityTotalSupply, refetch: refetchBalangaCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "BalangaCity",
  //   functionName: "totalSupply",
  // });

  // const { data: bangkokTotalSupply, refetch: refetchBangkokTotalSupply } = useScaffoldReadContract({
  //   contractName: "Bangkok",
  //   functionName: "totalSupply",
  // });

  // const { data: budapestTotalSupply, refetch: refetchBudapestTotalSupply } = useScaffoldReadContract({
  //   contractName: "Budapest",
  //   functionName: "totalSupply",
  // });

  // const { data: cebuTotalSupply, refetch: refetchCebuTotalSupply } = useScaffoldReadContract({
  //   contractName: "Cebu",
  //   functionName: "totalSupply",
  // });

  // const { data: cebu2TotalSupply, refetch: refetchCebu2TotalSupply } = useScaffoldReadContract({
  //   contractName: "Cebu2",
  //   functionName: "totalSupply",
  // });

  // const { data: cebu3TotalSupply, refetch: refetchCebu3TotalSupply } = useScaffoldReadContract({
  //   contractName: "Cebu3",
  //   functionName: "totalSupply",
  // });

  // const { data: dasmariasTotalSupply, refetch: refetchDasmariasTotalSupply } = useScaffoldReadContract({
  //   contractName: "Dasmarias",
  //   functionName: "totalSupply",
  // });

  // const { data: davaoCityTotalSupply, refetch: refetchDavaoCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "DavaoCity",
  //   functionName: "totalSupply",
  // });

  // const { data: delhiTotalSupply, refetch: refetchDelhiTotalSupply } = useScaffoldReadContract({
  //   contractName: "Delhi",
  //   functionName: "totalSupply",
  // });

  // const { data: enuguTotalSupply, refetch: refetchEnuguTotalSupply } = useScaffoldReadContract({
  //   contractName: "Enugu",
  //   functionName: "totalSupply",
  // });

  // const { data: haripurTotalSupply, refetch: refetchHaripurTotalSupply } = useScaffoldReadContract({
  //   contractName: "Haripur",
  //   functionName: "totalSupply",
  // });

  // const { data: istanbulTotalSupply, refetch: refetchIstanbulTotalSupply } = useScaffoldReadContract({
  //   contractName: "Istanbul",
  //   functionName: "totalSupply",
  // });

  // const { data: jakartaTotalSupply, refetch: refetchJakartaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Jakarta",
  //   functionName: "totalSupply",
  // });

  // const { data: kampalaTotalSupply, refetch: refetchKampalaTotalSupply } = useScaffoldReadContract({
  //   contractName: "Kampala",
  //   functionName: "totalSupply",
  // });

  // const { data: kisumuTotalSupply, refetch: refetchKisumuTotalSupply } = useScaffoldReadContract({
  //   contractName: "Kisumu",
  //   functionName: "totalSupply",
  // });

  // const { data: kyivTotalSupply, refetch: refetchKyivTotalSupply } = useScaffoldReadContract({
  //   contractName: "Kyiv",
  //   functionName: "totalSupply",
  // });

  // const { data: lagosTotalSupply, refetch: refetchLagosTotalSupply } = useScaffoldReadContract({
  //   contractName: "Lagos",
  //   functionName: "totalSupply",
  // });

  // const { data: legazpieCityTotalSupply, refetch: refetchLegazpieCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "LegazpieCity",
  //   functionName: "totalSupply",
  // });

  // const { data: lisbonTotalSupply, refetch: refetchLisbonTotalSupply } = useScaffoldReadContract({
  //   contractName: "Lisbon",
  //   functionName: "totalSupply",
  // });

  // const { data: makatiCityTotalSupply, refetch: refetchMakatiCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "MakatiCity",
  //   functionName: "totalSupply",
  // });

  // const { data: malolosCityTotalSupply, refetch: refetchMalolosCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "MalolosCity",
  //   functionName: "totalSupply",
  // });

  // const { data: mexicoCityTotalSupply, refetch: refetchMexicoCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "MexicoCity",
  //   functionName: "totalSupply",
  // });

  // const { data: nagaCityTotalSupply, refetch: refetchNagaCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "NagaCity",
  //   functionName: "totalSupply",
  // });

  // const { data: panabuCityTotalSupply, refetch: refetchPanabuCityTotalSupply } = useScaffoldReadContract({
  //   contractName: "PanabuCity",
  //   functionName: "totalSupply",
  // });

  // const { data: romeTotalSupply, refetch: refetchRomeTotalSupply } = useScaffoldReadContract({
  //   contractName: "Rome",
  //   functionName: "totalSupply",
  // });

  // const { data: saoPauloTotalSupply, refetch: refetchSaoPauloTotalSupply } = useScaffoldReadContract({
  //   contractName: "SaoPaulo",
  //   functionName: "totalSupply",
  // });

  // const { data: seoulTotalSupply, refetch: refetchSeoulTotalSupply } = useScaffoldReadContract({
  //   contractName: "Seoul",
  //   functionName: "totalSupply",
  // });

  // const { data: singaporeTotalSupply, refetch: refetchSingaporeTotalSupply } = useScaffoldReadContract({
  //   contractName: "Singapore",
  //   functionName: "totalSupply",
  // });

  // const { data: tagumTotalSupply, refetch: refetchTagumTotalSupply } = useScaffoldReadContract({
  //   contractName: "Tagum",
  //   functionName: "totalSupply",
  // });

  // const { data: zanzibarTotalSupply, refetch: refetchZanzibarTotalSupply } = useScaffoldReadContract({
  //   contractName: "Zanzibar",
  //   functionName: "totalSupply",
  // });

  // const { data: zugTotalSupply, refetch: refetchZugTotalSupply } = useScaffoldReadContract({
  //   contractName: "Zug",
  //   functionName: "totalSupply",
  // });

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

  // Add balanceOf for remaining events
  const { data: abujaBalance } = useScaffoldReadContract({
    contractName: "Abuja",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: addisAbabaBalance } = useScaffoldReadContract({
    contractName: "AddisAbaba",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: angelesCityBalance } = useScaffoldReadContract({
    contractName: "AngelesCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: austinBalance } = useScaffoldReadContract({
    contractName: "Austin",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: balangaCityBalance } = useScaffoldReadContract({
    contractName: "BalangaCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: bangkokBalance } = useScaffoldReadContract({
    contractName: "Bangkok",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: budapestBalance } = useScaffoldReadContract({
    contractName: "Budapest",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: cebuBalance } = useScaffoldReadContract({
    contractName: "Cebu",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: cebu2Balance } = useScaffoldReadContract({
    contractName: "Cebu2",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: cebu3Balance } = useScaffoldReadContract({
    contractName: "Cebu3",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: dasmariasBalance } = useScaffoldReadContract({
    contractName: "Dasmarias",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: davaoCityBalance } = useScaffoldReadContract({
    contractName: "DavaoCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: delhiBalance } = useScaffoldReadContract({
    contractName: "Delhi",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: enuguBalance } = useScaffoldReadContract({
    contractName: "Enugu",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: haripurBalance } = useScaffoldReadContract({
    contractName: "Haripur",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: istanbulBalance } = useScaffoldReadContract({
    contractName: "Istanbul",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: jakartaBalance } = useScaffoldReadContract({
    contractName: "Jakarta",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: kampalaBalance } = useScaffoldReadContract({
    contractName: "Kampala",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: kisumuBalance } = useScaffoldReadContract({
    contractName: "Kisumu",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: kyivBalance } = useScaffoldReadContract({
    contractName: "Kyiv",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: lagosBalance } = useScaffoldReadContract({
    contractName: "Lagos",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: legazpieCityBalance } = useScaffoldReadContract({
    contractName: "LegazpieCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: lisbonBalance } = useScaffoldReadContract({
    contractName: "Lisbon",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: makatiCityBalance } = useScaffoldReadContract({
    contractName: "MakatiCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: malolosCityBalance } = useScaffoldReadContract({
    contractName: "MalolosCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: mexicoCityBalance } = useScaffoldReadContract({
    contractName: "MexicoCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: nagaCityBalance } = useScaffoldReadContract({
    contractName: "NagaCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: panabuCityBalance } = useScaffoldReadContract({
    contractName: "PanabuCity",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: romeBalance } = useScaffoldReadContract({
    contractName: "Rome",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: saoPauloBalance } = useScaffoldReadContract({
    contractName: "SaoPaulo",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: seoulBalance } = useScaffoldReadContract({
    contractName: "Seoul",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: singaporeBalance } = useScaffoldReadContract({
    contractName: "Singapore",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: tagumBalance } = useScaffoldReadContract({
    contractName: "Tagum",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: zanzibarBalance } = useScaffoldReadContract({
    contractName: "Zanzibar",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: zugBalance } = useScaffoldReadContract({
    contractName: "Zug",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

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
  const { writeContractAsync: writeCartagenaAsync } = useScaffoldWriteContract({ contractName: "Cartagena" });
  const { writeContractAsync: writeAccraAsync } = useScaffoldWriteContract({ contractName: "Accra" });
  const { writeContractAsync: writeDaNangAsync } = useScaffoldWriteContract({ contractName: "DaNang" });
  const { writeContractAsync: writeMumbaiAsync } = useScaffoldWriteContract({ contractName: "Mumbai" });
  const { writeContractAsync: writeBangaloreAsync } = useScaffoldWriteContract({ contractName: "Bangalore" });
  const { writeContractAsync: writeNewYorkCityAsync } = useScaffoldWriteContract({ contractName: "NewYorkCity" });
  const { writeContractAsync: writeBuenosAiresAsync } = useScaffoldWriteContract({ contractName: "BuenosAires" });
  const { writeContractAsync: writeManilaAsync } = useScaffoldWriteContract({ contractName: "Manila" });
  const { writeContractAsync: writeDubaiAsync } = useScaffoldWriteContract({ contractName: "Dubai" });
  const { writeContractAsync: writeDarEsSalaamAsync } = useScaffoldWriteContract({ contractName: "DarEsSalaam" });
  const { writeContractAsync: writeKigaliAsync } = useScaffoldWriteContract({ contractName: "Kigali" });

  // Add write contract hooks for remaining events
  const { writeContractAsync: writeAbujaAsync } = useScaffoldWriteContract({ contractName: "Abuja" });
  const { writeContractAsync: writeAddisAbabaAsync } = useScaffoldWriteContract({ contractName: "AddisAbaba" });
  const { writeContractAsync: writeAngelesCityAsync } = useScaffoldWriteContract({ contractName: "AngelesCity" });
  const { writeContractAsync: writeAustinAsync } = useScaffoldWriteContract({ contractName: "Austin" });
  const { writeContractAsync: writeBalangaCityAsync } = useScaffoldWriteContract({ contractName: "BalangaCity" });
  const { writeContractAsync: writeBangkokAsync } = useScaffoldWriteContract({ contractName: "Bangkok" });
  const { writeContractAsync: writeBudapestAsync } = useScaffoldWriteContract({ contractName: "Budapest" });
  const { writeContractAsync: writeCebuAsync } = useScaffoldWriteContract({ contractName: "Cebu" });
  const { writeContractAsync: writeCebu2Async } = useScaffoldWriteContract({ contractName: "Cebu2" });
  const { writeContractAsync: writeCebu3Async } = useScaffoldWriteContract({ contractName: "Cebu3" });
  const { writeContractAsync: writeDasmariasAsync } = useScaffoldWriteContract({ contractName: "Dasmarias" });
  const { writeContractAsync: writeDavaoCityAsync } = useScaffoldWriteContract({ contractName: "DavaoCity" });
  const { writeContractAsync: writeDelhiAsync } = useScaffoldWriteContract({ contractName: "Delhi" });
  const { writeContractAsync: writeEnuguAsync } = useScaffoldWriteContract({ contractName: "Enugu" });
  const { writeContractAsync: writeHaripurAsync } = useScaffoldWriteContract({ contractName: "Haripur" });
  const { writeContractAsync: writeIstanbulAsync } = useScaffoldWriteContract({ contractName: "Istanbul" });
  const { writeContractAsync: writeJakartaAsync } = useScaffoldWriteContract({ contractName: "Jakarta" });
  const { writeContractAsync: writeKampalaAsync } = useScaffoldWriteContract({ contractName: "Kampala" });
  const { writeContractAsync: writeKisumuAsync } = useScaffoldWriteContract({ contractName: "Kisumu" });
  const { writeContractAsync: writeKyivAsync } = useScaffoldWriteContract({ contractName: "Kyiv" });
  const { writeContractAsync: writeLagosAsync } = useScaffoldWriteContract({ contractName: "Lagos" });
  const { writeContractAsync: writeLegazpieCityAsync } = useScaffoldWriteContract({ contractName: "LegazpieCity" });
  const { writeContractAsync: writeLisbonAsync } = useScaffoldWriteContract({ contractName: "Lisbon" });
  const { writeContractAsync: writeMakatiCityAsync } = useScaffoldWriteContract({ contractName: "MakatiCity" });
  const { writeContractAsync: writeMalolosCityAsync } = useScaffoldWriteContract({ contractName: "MalolosCity" });
  const { writeContractAsync: writeMexicoCityAsync } = useScaffoldWriteContract({ contractName: "MexicoCity" });
  const { writeContractAsync: writeNagaCityAsync } = useScaffoldWriteContract({ contractName: "NagaCity" });
  const { writeContractAsync: writePanabuCityAsync } = useScaffoldWriteContract({ contractName: "PanabuCity" });
  const { writeContractAsync: writeRomeAsync } = useScaffoldWriteContract({ contractName: "Rome" });
  const { writeContractAsync: writeSaoPauloAsync } = useScaffoldWriteContract({ contractName: "SaoPaulo" });
  const { writeContractAsync: writeSeoulAsync } = useScaffoldWriteContract({ contractName: "Seoul" });
  const { writeContractAsync: writeSingaporeAsync } = useScaffoldWriteContract({ contractName: "Singapore" });
  const { writeContractAsync: writeTagumAsync } = useScaffoldWriteContract({ contractName: "Tagum" });
  const { writeContractAsync: writeZanzibarAsync } = useScaffoldWriteContract({ contractName: "Zanzibar" });
  const { writeContractAsync: writeZugAsync } = useScaffoldWriteContract({ contractName: "Zug" });

  const nftWriteMapping = [
    writeBangkokAsync, // ID 0: Bangkok, Thailand
    writeNewYorkCityAsync, // ID 1: New York City, USA
    writeZugAsync, // ID 2: Zug, Switzerland
    writeYogyakartaAsync, // ID 3: Yogyakarta, Indonesia
    writeSwabiAsync, // ID 4: Swabi, Pakistan
    writeSaoPauloAsync, // ID 5: São Paulo, Brazil
    writeSeoulAsync, // ID 6: Seoul, South Korea
    writeSingaporeAsync, // ID 7: Singapore
    writeRomeAsync, // ID 8: Rome, Italy
    writePuneAsync, // ID 9: Pune, India
    writeMumbaiAsync, // ID 10: Mumbai, India
    writeNagaCityAsync, // ID 11: Naga City, Philippines
    writeNairobiAsync, // ID 12: Nairobi, Kenya
    writeMakatiCityAsync, // ID 13: Makati City, Philippines
    writeMalolosCityAsync, // ID 14: Malolos City, Philippines
    writeManilaAsync, // ID 15: Manila City, Philippines
    writeMexicoCityAsync, // ID 16: Mexico City, Mexico
    writeLegazpieCityAsync, // ID 17: Legazpie City, Philippines
    writeKampalaAsync, // ID 18: Kampala, Uganda
    writeLisbonAsync, // ID 19: Lisbon, Portugal
    writeKigaliAsync, // ID 20: Kigali, Rwanda
    writeKisumuAsync, // ID 21: Kisumu, Kenya
    writeKyivAsync, // ID 22: Kyiv, Ukraine
    writeHongKongAsync, // ID 23: Hong Kong
    writeIstanbulAsync, // ID 24: Istanbul, Turkey
    writeJakartaAsync, // ID 25: Jakarta, Indonesia
    writeDelhiAsync, // ID 26: Delhi, India
    writeEnuguAsync, // ID 27: Enugu, Nigeria
    writeHaripurAsync, // ID 28: Haripur, Pakistan
    writeDarEsSalaamAsync, // ID 29: Dar Es Salaam, Tanzania
    writeDasmariasAsync, // ID 30: Dasmariñas, Philippines
    writeDavaoCityAsync, // ID 31: Davao City, Philippines
    writeCebu2Async, // ID 32: Cebu 2, Philippines
    writeCebu3Async, // ID 33: Cebu 3, Philippines
    writeCebuAsync, // ID 34: Cebu, Philippines
    writeDaNangAsync, // ID 35: Da Nang, Vietnam
    writeBuenosAiresAsync, // ID 36: Buenos Aires, Argentina
    writeCamarinesAsync, // ID 37: Camarines, Philippines
    writeCartagenaAsync, // ID 38: Cartagena, Colombia
    writeBangaloreAsync, // ID 39: Bangalore, India
    writeBudapestAsync, // ID 40: Budapest, Hungary
    writeAngelesCityAsync, // ID 41: Angeles City, Philippines
    writeAustinAsync, // ID 42: Austin, USA
    writeBalangaCityAsync, // ID 43: Balanga City, Philippines
    writeAddisAbabaAsync, // ID 44: Addis Ababa, Ethiopia
    writeAccraAsync, // ID 45: Accra, Ghana
    writeAbujaAsync, // ID 46: Abuja, Nigeria
    writeTagumAsync, // ID 47: Tagum, Philippines
    writePanabuCityAsync, // ID 48: Panabu City, Philippines
    writeLagosAsync, // ID 49: Lagos, Nigeria
    writeZanzibarAsync, // ID 50: Zanzibar, Tanzania
    writeBrusselsAsync, // Additional functions
    writeGoshoAsync,
    writeNdotohubAsync,
    writeDubaiAsync,
  ];

  const nftBalanceMapping = [
    bangkokBalance, // ID 0: Bangkok, Thailand
    newYorkCityBalance, // ID 1: New York City, USA
    zugBalance, // ID 2: Zug, Switzerland
    yogyakartaBalance, // ID 3: Yogyakarta, Indonesia
    swabiBalance, // ID 4: Swabi, Pakistan
    saoPauloBalance, // ID 5: São Paulo, Brazil
    seoulBalance, // ID 6: Seoul, South Korea
    singaporeBalance, // ID 7: Singapore
    romeBalance, // ID 8: Rome, Italy
    puneBalance, // ID 9: Pune, India
    mumbaiBalance, // ID 10: Mumbai, India
    nagaCityBalance, // ID 11: Naga City, Philippines
    nairobiBalance, // ID 12: Nairobi, Kenya
    makatiCityBalance, // ID 13: Makati City, Philippines
    malolosCityBalance, // ID 14: Malolos City, Philippines
    manilaBalance, // ID 15: Manila City, Philippines
    mexicoCityBalance, // ID 16: Mexico City, Mexico
    legazpieCityBalance, // ID 17: Legazpie City, Philippines
    kampalaBalance, // ID 18: Kampala, Uganda
    lisbonBalance, // ID 19: Lisbon, Portugal
    kigaliBalance, // ID 20: Kigali, Rwanda
    kisumuBalance, // ID 21: Kisumu, Kenya
    kyivBalance, // ID 22: Kyiv, Ukraine
    hongKongBalance, // ID 23: Hong Kong
    istanbulBalance, // ID 24: Istanbul, Turkey
    jakartaBalance, // ID 25: Jakarta, Indonesia
    delhiBalance, // ID 26: Delhi, India
    enuguBalance, // ID 27: Enugu, Nigeria
    haripurBalance, // ID 28: Haripur, Pakistan
    darEsSalaamBalance, // ID 29: Dar Es Salaam, Tanzania
    dasmariasBalance, // ID 30: Dasmariñas, Philippines
    davaoCityBalance, // ID 31: Davao City, Philippines
    cebu2Balance, // ID 32: Cebu 2, Philippines
    cebu3Balance, // ID 33: Cebu 3, Philippines
    cebuBalance, // ID 34: Cebu, Philippines
    daNangBalance, // ID 35: Da Nang, Vietnam
    buenosAiresBalance, // ID 36: Buenos Aires, Argentina
    camarinesBalance, // ID 37: Camarines, Philippines
    cartagenaBalance, // ID 38: Cartagena, Colombia
    bangaloreBalance, // ID 39: Bangalore, India
    budapestBalance, // ID 40: Budapest, Hungary
    angelesCityBalance, // ID 41: Angeles City, Philippines
    austinBalance, // ID 42: Austin, USA
    balangaCityBalance, // ID 43: Balanga City, Philippines
    addisAbabaBalance, // ID 44: Addis Ababa, Ethiopia
    accraBalance, // ID 45: Accra, Ghana
    abujaBalance, // ID 46: Abuja, Nigeria
    tagumBalance, // ID 47: Tagum, Philippines
    panabuCityBalance, // ID 48: Panabu City, Philippines
    lagosBalance, // ID 49: Lagos, Nigeria
    zanzibarBalance, // ID 50: Zanzibar, Tanzania
    brusselsBalance, // Additional functions
    goshoBalance,
    ndotohubBalance,
    dubaiBalance,
  ];

  // const nftTotalSupplyMapping = [
  //   brusselsTotalSupply,
  //   goshoTotalSupply,
  //   yogyakartaTotalSupply,
  //   ndotohubTotalSupply,
  //   swabiTotalSupply,
  //   camarinesTotalSupply,
  //   puneTotalSupply,
  //   nairobiTotalSupply,
  //   hongKongTotalSupply,
  //   accraTotalSupply,
  //   cartagenaTotalSupply,
  //   daNangTotalSupply,
  //   mumbaiTotalSupply,
  //   bangaloreTotalSupply,
  //   newYorkCityTotalSupply,
  //   buenosAiresTotalSupply,
  //   manilaTotalSupply,
  //   dubaiTotalSupply,
  //   darEsSalaamTotalSupply,
  //   kigaliTotalSupply,
  //   abujaTotalSupply,
  //   addisAbabaTotalSupply,
  //   angelesCityTotalSupply,
  //   austinTotalSupply,
  //   balangaCityTotalSupply,
  //   bangkokTotalSupply,
  //   budapestTotalSupply,
  //   cebuTotalSupply,
  //   cebu2TotalSupply,
  //   cebu3TotalSupply,
  //   dasmariasTotalSupply,
  //   davaoCityTotalSupply,
  //   delhiTotalSupply,
  //   enuguTotalSupply,
  //   haripurTotalSupply,
  //   istanbulTotalSupply,
  //   jakartaTotalSupply,
  //   kampalaTotalSupply,
  //   kisumuTotalSupply,
  //   kyivTotalSupply,
  //   lagosTotalSupply,
  //   legazpieCityTotalSupply,
  //   lisbonTotalSupply,
  //   makatiCityTotalSupply,
  //   malolosCityTotalSupply,
  //   mexicoCityTotalSupply,
  //   nagaCityTotalSupply,
  //   panabuCityTotalSupply,
  //   romeTotalSupply,
  //   saoPauloTotalSupply,
  //   seoulTotalSupply,
  //   singaporeTotalSupply,
  //   tagumTotalSupply,
  //   zanzibarTotalSupply,
  //   zugTotalSupply,
  // ];

  async function pledge(event: SyntheticEvent) {
    event.preventDefault();

    // console.log("userLocation");
    // console.log(userLocation);

    // // If user doesn't have a location, use a default one

    // if (userLocation) {
    //   console.log(userLocation);
    //   const userLat = userLocation.lat;
    //   const userLng = userLocation.lng;

    //   const testLongitude = parseUnits(userLng.toString(), 9);
    //   const testLatitude = parseUnits(userLat.toString(), 9);

    //   const newAttestationUID = await attestLocation({ lat: testLatitude, lng: testLongitude });
    //   console.log("newAttestationUID");
    //   console.log(newAttestationUID);
    // }

    await nftWriteMapping[selectedMarker?.id ?? 0]({
      functionName: "mint",
      //args: ["0x0000000000000000000000000000000000000000" as `0x${string}`],
    });
  }

  // Handler for when user focuses on a location from a cluster
  const handleFocusFromCluster = (focused: boolean) => {
    setFocusedLocationFromCluster(focused);
  };

  // Add a dummy map click handler since we disabled manual mode
  // This empty function replaces the previous handleMapClick that was removed
  const handleMapClick = () => {
    // No-op function since manual mode is disabled
  };

  // Handler to return to the cluster view
  const handleBackToClusters = () => {
    if (mapRef.current) {
      // Zoom out to see the clusters again
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom !== undefined && currentZoom > 7) {
        mapRef.current.setZoom(7);
      }
      setFocusedLocationFromCluster(false);
    }
  };

  // Handler to get map instance reference
  const handleMapLoad = (map: any) => {
    mapRef.current = map;
  };

  return (
    <>
      {/* {showLoadingOverlay && <LoadingOverlay message="Finding your Homebase..." duration={5000} />} */}
      <LoadingOverlay message="Finding your Homebase..." duration={3000} />

      {/* Header div with controls - most controls commented out */}
      <div className="flex justify-between items-center mb-4 px-4">
        {/* Left side is now empty since controls are commented out */}
        <div className="flex items-center space-x-4">
          {/* Manual location toggle - commented out
          <label className="cursor-pointer label">
            <span className="label-text mr-2">Manual Location</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isManualMode}
              onChange={toggleManualMode}
            />
          </label>
          */}

          {/* Cluster radius slider - commented out
          <div className="flex items-center space-x-2">
            <span className="label-text">Cluster Radius: {(clusterRadius / 1000).toFixed(0)}km</span>
            <input
              type="range"
              min="5000"
              max="50000"
              step="5000"
              value={clusterRadius}
              onChange={e => setClusterRadius(Number(e.target.value))}
              className="range range-primary range-xs"
            />
            <div
              className="tooltip"
              data-tip="Clusters will be shown at all zoom levels. Events within this radius will be grouped together."
            >
              <span className="text-info cursor-help text-sm">ⓘ</span>
            </div>
          </div>
          */}
        </div>

        {/* Right side - keep the back button */}
        <div className="flex items-center gap-4">
          {focusedLocationFromCluster && (
            <button onClick={handleBackToClusters} className="btn btn-sm btn-outline btn-primary">
              ← Back to clusters
            </button>
          )}

          {/* Manual location info - commented out
          {isManualMode && (
            <div className="text-sm text-info">
              {userLocation
                ? `Current location: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                : "Click on the map to set your location"}
            </div>
          )}
          */}
        </div>
      </div>

      <HomebaseMap
        userLocation={userLocation}
        center={center}
        locations={locations}
        containerStyle={mapContainerStyle}
        isManualMode={false}
        onMapClick={handleMapClick}
        clusterRadius={clusterRadius}
        onFocusFromCluster={handleFocusFromCluster}
        onMapLoad={handleMapLoad}
        infoWindowChildren={(location: Location) => (
          <div className="p-4 text-center bg-base-300 m-4 rounded-lg items-center flex justify-center flex-col">
            <Image
              width={200}
              height={200}
              className="w-48 h-32 object-cover rounded-lg mb-3"
              src={location.image || "/homebase.jpg"}
              alt={location.title}
            />
            <p className="m-0 text-xl text-black">{location.title}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-outline">{location.region}</span>
              <span className="badge badge-outline">{location.date}</span>
            </div>

            {location.lumaLink && (
              <a
                href={location.lumaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-sm mb-4"
              >
                Register on Luma
              </a>
            )}

            {/* <p className="m-0 text-2xl md:text-xl text-black">Pledges</p> */}
            {/* <p className="m-0 text-2xl md:text-6xl text-black">{nftTotalSupplyMapping[location.id]}</p> */}

            {!focusedLocationFromCluster &&
              connectedAddress &&
              ((nftBalanceMapping?.[location.id] ?? 0) > 0 ? (
                <p className="text-green-600 text-2xl">You call this place your homebase!</p>
              ) : (
                <>
                  {/* {userLocation && (
                    <button className="btn btn-primary btn-sm" onClick={pledge}>
                      Verify Homebase
                    </button>
                  )} */}
                  <button className="btn btn-primary btn-sm" onClick={pledge}>
                    Check in
                  </button>
                </>
              ))}

            {!connectedAddress && !focusedLocationFromCluster && <ConnectButton />}

            {/* Add the NFT holders list */}
            <NFTHoldersList contractAddress={location.address} />
          </div>
        )}
      />

      <UserAlignedLocations />
    </>
  );
}
