export const NFTCard = ({ nft }: { nft: any }) => {
  return (
    <>
      <div className="w-96">
        <img src={nft?.image} alt={nft?.name} />
        <h3>{nft?.name}</h3>
        <p>{nft?.description}</p>
      </div>
    </>
  );
};
