import { useEffect, useState } from "react";
import { useScaffoldContract } from "../scaffold-eth";
import { getAddress } from "viem";
import { locations } from "~~/locations.config";

export const useLocationScores = () => {
  const [locationScores, setLocationScores] = useState<{ [key: string]: number }>({});

  const { data: alignmentManager } = useScaffoldContract({
    contractName: "AlignmentManagerV1",
  });

  const fetchLocationScores = async () => {
    if (!alignmentManager) return;

    const scores: { [key: string]: number } = {};
    for (const location of locations) {
      const score = await alignmentManager.read.getEntityAlignmentScore([getAddress(location.address)]);
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

  return { locationScores, fetchLocationScores };
};
