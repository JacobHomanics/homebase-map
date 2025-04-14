import { MarkerWithInfowindow } from "../MarkerWithInfowindow";
import { APIProvider, AdvancedMarker, Map, Pin } from "@vis.gl/react-google-maps";
import { UserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { Location } from "~~/locations.config";

interface HomebaseMapProps {
  userLocation: UserLocation | null;
  center: UserLocation;
  locations: Location[];
  containerStyle: {
    width: string;
    height: string;
  };
  infoWindowChildren: React.ReactNode;
}

export const HomebaseMap = ({
  userLocation,
  center,
  locations,
  containerStyle,
  infoWindowChildren,
}: HomebaseMapProps) => {
  const { set } = useSelectedMarker();

  return (
    <>
      {" "}
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
        <Map
          style={containerStyle}
          defaultCenter={center}
          defaultZoom={4}
          gestureHandling={"greedy"}
          mapId="8c78d816c97d148e"
        />

        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <Pin scale={1} background="#0052FF" borderColor="#000000" glyphColor="#000000" />
          </AdvancedMarker>
        )}

        {locations.map(marker => (
          <MarkerWithInfowindow key={marker.id} position={marker.position} onClick={() => set(marker)}>
            {infoWindowChildren}
          </MarkerWithInfowindow>
        ))}
      </APIProvider>
    </>
  );
};
