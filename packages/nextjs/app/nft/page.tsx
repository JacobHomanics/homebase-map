"use client";

import { useEffect } from "react";
import type { NextPage } from "next";
import { NFTCard } from "~~/components/homebase-map/nftCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTokenURI } from "~~/hooks/useTokenURI";

const NFT: NextPage = () => {
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

  console.log(brusselsNFT);
  console.log(goshoNFT);
  console.log(yogyakartaNFT);
  console.log(ndotohubNFT);

  return (
    <div className="flex flex-wrap items-center justify-center w-full gap-10">
      <NFTCard nft={brusselsNFT} />
      <NFTCard nft={goshoNFT} />
      <NFTCard nft={yogyakartaNFT} />
      <NFTCard nft={ndotohubNFT} />
    </div>
  );
};

export default NFT;
