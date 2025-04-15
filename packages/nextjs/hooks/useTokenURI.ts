import { useEffect, useState } from "react";

export const useTokenURI = (tokenURI: string | undefined) => {
  const [nft, setNft] = useState<any>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (tokenURI) {
        const nft = await fetch(tokenURI);
        const nftJson = await nft.json();
        setNft(nftJson);
      }
    };
    fetchNFTs();
  }, [tokenURI]);

  return { nft };
};
