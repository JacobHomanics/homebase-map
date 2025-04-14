import { useEffect, useState } from "react";
import { MarkerWithInfowindow } from "../MarkerWithInfowindow";
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from "@vis.gl/react-google-maps";
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
  infoWindowChildren: (location: Location) => React.ReactNode;
}

const UserLocationCircle = ({ position }: { position: UserLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      center: position,
      radius: 56327.04, // 5 miles in meters: 8046.72. 35 miles in meters: 56327.04
      fillColor: "#0052FF",
      fillOpacity: 0.1,
      strokeColor: "#0052FF",
      strokeOpacity: 0.5,
      strokeWeight: 1,
      map,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, position]);

  return null;
};

export const HomebaseMap = ({
  userLocation,
  center,
  locations,
  containerStyle,
  infoWindowChildren,
}: HomebaseMapProps) => {
  const { set } = useSelectedMarker();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);

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
        >
          {locations.map(marker => (
            <MarkerWithInfowindow
              key={marker.id}
              position={marker.position}
              onClick={() => {
                set(marker);
                setOpenInfoWindowId(marker.id);
              }}
              isOpen={openInfoWindowId === marker.id}
              onClose={() => setOpenInfoWindowId(null)}
            >
              {infoWindowChildren(marker)}
            </MarkerWithInfowindow>
          ))}

          {userLocation && (
            <>
              <AdvancedMarker position={userLocation}>
                <Pin scale={1} background="#0052FF" borderColor="#000000" glyphColor="#000000" />
              </AdvancedMarker>
              <UserLocationCircle position={userLocation} />
            </>
          )}
        </Map>
      </APIProvider>
    </>
  );
};
