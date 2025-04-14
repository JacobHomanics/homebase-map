import { InfoWindow } from "@react-google-maps/api";
import { LoadScript, Marker } from "@react-google-maps/api";
import { GoogleMap } from "@react-google-maps/api";
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
  const { selectedMarker, set } = useSelectedMarker();
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={4} //options={{ styles: customMapStyle }}//
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            title="Your Location"
          />
        )}

        {locations.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => set(marker)} // Show InfoWindow on click
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => set(undefined)} // Close InfoWindow on click
          >
            {infoWindowChildren}
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};
