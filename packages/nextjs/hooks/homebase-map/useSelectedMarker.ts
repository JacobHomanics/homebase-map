import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Location } from "~~/locations.config";

const SELECTED_MARKER_KEY = ["selectedMarker"];

export const useSelectedMarker = () => {
  const queryClient = useQueryClient();

  const { data: selectedMarker } = useQuery<Location | null>({
    queryKey: SELECTED_MARKER_KEY,
    queryFn: () => {
      // Return null as initial state instead of undefined
      return null;
    },
    // Keep the data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache the data for 10 minutes
    gcTime: 10 * 60 * 1000,
  });

  const { mutate: set } = useMutation({
    mutationFn: (location: Location | null) => {
      return Promise.resolve(location);
    },
    onSuccess: location => {
      // Update the cache with the new selected marker
      queryClient.setQueryData(SELECTED_MARKER_KEY, location);
    },
  });

  return { selectedMarker, set };
};
