import { useEffect, useState } from "react";
import { Location } from "~~/locations.config";

export const useSelectedMarker = () => {
  const [selectedMarker, setSelectedMarker] = useState<Location>();

  async function set(location: Location | undefined) {
    setSelectedMarker(location);
  }

  useEffect(() => {
    console.log(selectedMarker);
  }, [selectedMarker]);

  return { selectedMarker, set };
};
