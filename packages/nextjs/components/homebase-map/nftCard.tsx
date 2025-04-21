import Image from "next/image";

export const NFTCard = ({ nft }: { nft: any }) => {
  return (
    <>
      <div className="w-96">
        <Image src={nft?.image} alt={nft?.name} width={384} height={384} />
        <h3>{nft?.name}</h3>
        <p>{nft?.description}</p>
      </div>
    </>
  );
};
