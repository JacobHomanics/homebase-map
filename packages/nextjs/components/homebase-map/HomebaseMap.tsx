import { useEffect, useState } from "react";
import { MarkerWithInfowindow } from "../MarkerWithInfowindow";
import { APIProvider, AdvancedMarker, Map, MapMouseEvent, Pin, useMap } from "@vis.gl/react-google-maps";
import { UserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { Location } from "~~/locations.config";
import { DEFAULT_RANGE_METERS } from "~~/utils/distance";

interface HomebaseMapProps {
  userLocation: UserLocation | null;
  center: UserLocation;
  locations: Location[];
  containerStyle: {
    width: string;
    height: string;
  };
  infoWindowChildren: (location: Location) => React.ReactNode;
  isManualMode?: boolean;
  onMapClick?: (location: UserLocation) => void;
}

const UserLocationCircle = ({ position }: { position: UserLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Helper function to create circle points
    const getCirclePoints = (center: google.maps.LatLngLiteral, radius: number) => {
      const points: google.maps.LatLngLiteral[] = [];
      const numPoints = 64; // Number of points to create the circle

      for (let i = 0; i < numPoints; i++) {
        const heading = (i * 360) / numPoints;
        const point = google.maps.geometry.spherical.computeOffset(new google.maps.LatLng(center), radius, heading);
        points.push({ lat: point.lat(), lng: point.lng() });
      }

      // Close the polygon
      points.push(points[0]);
      return points;
    };

    const circlePoints = getCirclePoints(position, DEFAULT_RANGE_METERS);

    const circle = new google.maps.Polygon({
      paths: circlePoints,
      fillColor: "#0052FF",
      fillOpacity: 0.1,
      strokeColor: "#0052FF",
      strokeOpacity: 0.5,
      strokeWeight: 1,
      map,
      clickable: false, // Make the circle non-clickable so clicks pass through to the map
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, position]);

  return null;
};

const MapCenter = ({ center }: { center: UserLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  return null;
};

export const HomebaseMap = ({
  userLocation,
  center,
  locations,
  containerStyle,
  infoWindowChildren,
  isManualMode = false,
  onMapClick,
}: HomebaseMapProps) => {
  const { set } = useSelectedMarker();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);

  // Handle map click events when in manual mode
  const handleMapClick = (e: MapMouseEvent) => {
    if (isManualMode && onMapClick && e.detail?.latLng) {
      onMapClick({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
    }
  };

  return (
    <>
      {" "}
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""} libraries={["geometry"]}>
        <Map
          style={containerStyle}
          defaultCenter={center}
          defaultZoom={4}
          gestureHandling={"greedy"}
          mapId="8c78d816c97d148e"
          onClick={handleMapClick}
        >
          <MapCenter center={center} />
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
