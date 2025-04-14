import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Location, locations } from "~~/locations.config";

export const UserAlignedLocations = () => {
  const { address: connectedAddress } = useAccount();

  const { data: userAlignedLocations } = useScaffoldReadContract({
    contractName: "AlignmentManagerV1",
    functionName: "getUserAlignments",
    args: [connectedAddress],
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-10 bg-primary">
      {userAlignedLocations && userAlignedLocations.length > 0 && (
        <div>
          <p className="text-center">{"You are Based in: "}</p>

          <p className="text-center">
            {userAlignedLocations
              ?.map((location: any) => locations.find(marker => marker.address === location)?.title)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};
