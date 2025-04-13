import { useEffect, useState } from "react";
import { locations } from "../locations.config";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export function Charts() {
  const { data: alignmentManager } = useScaffoldContract({
    contractName: "AlignmentManagerV1",
  });

  const [locationScores, setLocationScores] = useState<{ [key: string]: number }>({});

  const fetchLocationScores = async () => {
    if (!alignmentManager) return;

    const scores: { [key: string]: number } = {};
    for (const location of locations) {
      const score = await alignmentManager.read.getEntityAlignmentScore([location.address]);
      scores[location.address] = Number(score);
    }
    setLocationScores(scores);
  };

  useEffect(
    () => {
      fetchLocationScores();
    },
    // eslint-disable-next-line
    [alignmentManager?.address],
  );

  return (
    <>
      {locations.map((location, index) => (
        <div key={index} className="bg-primary shadow-md rounded-lg p-4 m-2">
          <h3 className="text-xl font-semibold">{location.title}</h3>
          <p className="text-lg">Score: {locationScores[location.address]}</p>
        </div>
      ))}
    </>
  );
}
