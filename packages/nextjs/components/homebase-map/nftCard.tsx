import Image from "next/image";

export const NFTCard = ({ nft }: { nft: any }) => {
  return (
    <>
      <div className="w-96">
        {nft?.image && (
          <div className="relative w-full h-64">
            <Image src={nft.image} alt={nft?.name || "NFT"} fill style={{ objectFit: "contain" }} />
          </div>
        )}
        <h3>{nft?.name}</h3>
        <p>{nft?.description}</p>
      </div>
    </>
  );
};
