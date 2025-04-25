import React, { useEffect, useState } from "react";
import { MarkerWithInfowindow } from "../MarkerWithInfowindow";
import { ClusterInfoWindow } from "../homebase-map/ClusterInfoWindow";
import { ClusterMarker } from "../homebase-map/ClusterMarker";
import { APIProvider, AdvancedMarker, Map, MapMouseEvent, Pin, useMap } from "@vis.gl/react-google-maps";
import { UserLocation } from "~~/hooks/homebase-map/useGetUserLocation";
import { useSelectedMarker } from "~~/hooks/homebase-map/useSelectedMarker";
import { Location } from "~~/locations.config";
import { Cluster, clusterLocations } from "~~/utils/clustering";
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
  clusterRadius?: number; // Radius in meters for clustering
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

const MapContainer = ({
  userLocation,
  center,
  locations,
  infoWindowChildren,
  isManualMode,
  onMapClick,
  containerStyle,
  clusterRadius = 15000, // Default 15km radius for clustering
}: HomebaseMapProps) => {
  const { set } = useSelectedMarker();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);
  const [openClusterId, setOpenClusterId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(4);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const map = useMap();

  // Handle zoom change to determine whether to show clusters
  useEffect(() => {
    if (map) {
      const handleZoomChanged = () => {
        const newZoom = map.getZoom();
        if (newZoom !== undefined) {
          setZoom(newZoom);
        }
      };

      map.addListener("zoom_changed", handleZoomChanged);
      return () => {
        google.maps.event.clearListeners(map, "zoom_changed");
      };
    }
  }, [map]);

  // Center map on user location when it changes
  useEffect(() => {
    if (!map || !userLocation) return;

    // Center the map on user location
    map.panTo(userLocation);
  }, [map, userLocation]);

  // Memoize clusters calculation
  const computeClusters = React.useCallback(() => {
    if (zoom < 8) {
      return clusterLocations(locations, clusterRadius);
    }
    return [];
  }, [locations, clusterRadius, zoom]);

  // Update clusters when locations, zoom, or clusterRadius changes
  useEffect(() => {
    const newClusters = computeClusters();
    setClusters(newClusters);

    // If changing cluster radius, close any open cluster info windows
    if (openClusterId && newClusters.every(c => c.id !== openClusterId)) {
      setOpenClusterId(null);
    }
  }, [computeClusters, openClusterId]);

  // Handle map click events when in manual mode
  const handleMapClick = (e: MapMouseEvent) => {
    if (isManualMode && onMapClick && e.detail?.latLng) {
      onMapClick({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
    }
  };

  const handleClusterClick = (cluster: Cluster) => {
    setOpenClusterId(cluster.id);
    // Clear any open single marker infowindows
    setOpenInfoWindowId(null);
  };

  const shouldShowClusters = zoom < 8 && clusters.length > 0;

  return (
    <Map
      style={containerStyle}
      defaultCenter={center}
      defaultZoom={4}
      gestureHandling={"greedy"}
      mapId="8c78d816c97d148e"
      onClick={handleMapClick}
      onZoomChanged={event => {
        if (event.detail?.zoom !== undefined) {
          setZoom(event.detail.zoom);
        }
      }}
      controlSize={24}
      zoomControl={true}
    >
      {shouldShowClusters
        ? // Render clusters
          clusters.map(cluster => (
            <React.Fragment key={cluster.id}>
              <ClusterMarker cluster={cluster} onClick={() => handleClusterClick(cluster)} />
              {openClusterId === cluster.id && (
                <ClusterInfoWindow
                  cluster={cluster}
                  onClose={() => setOpenClusterId(null)}
                  renderLocation={locationId => {
                    const location = locations.find(loc => loc.id === locationId);
                    if (!location) return null;
                    return infoWindowChildren(location);
                  }}
                />
              )}
            </React.Fragment>
          ))
        : // Render individual markers
          locations.map(marker => (
            <MarkerWithInfowindow
              key={marker.id}
              position={marker.position}
              onClick={() => {
                set(marker);
                setOpenInfoWindowId(marker.id);
              }}
              isOpen={openInfoWindowId === marker.id}
              onClose={() => setOpenInfoWindowId(null)}
              image={marker.image || "/homebase.jpg"}
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
  );
};

export const HomebaseMap = (props: HomebaseMapProps) => {
  return (
    <>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""} libraries={["geometry"]}>
        <MapContainer {...props} />
      </APIProvider>
    </>
  );
};
