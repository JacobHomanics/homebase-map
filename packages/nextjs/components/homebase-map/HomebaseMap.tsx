import React, { useEffect, useState } from "react";
import { MarkerWithInfowindow } from "../MarkerWithInfowindow";
import { ClusterInfoWindow } from "../homebase-map/ClusterInfoWindow";
import { ClusterMarker } from "../homebase-map/ClusterMarker";
import { APIProvider, AdvancedMarker, InfoWindow, Map, MapMouseEvent, Pin, useMap } from "@vis.gl/react-google-maps";
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
  onFocusFromCluster?: (focused: boolean) => void;
  onMapLoad?: (map: google.maps.Map) => void;
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

// Add a FocusedLocationMarker component to highlight the selected location
const FocusedLocationMarker = ({ location, onClick }: { location: Location; onClick: () => void }) => {
  const [pulse, setPulse] = useState(true);

  // Turn off pulsing animation after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulse(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdvancedMarker position={location.position} onClick={onClick}>
      <div className="relative">
        {/* Pulsing highlight effect */}
        {pulse && <div className="absolute -inset-6 rounded-full bg-primary opacity-30 animate-ping" />}
        {/* Highlight ring */}
        <div className="absolute -inset-3 rounded-full bg-primary opacity-20" />
        {/* Marker image with shadow effect */}
        <div
          className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-xl transform hover:scale-105 transition-transform"
          style={{
            backgroundImage: `url(${location.image || "/homebase.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 0 15px rgba(0, 82, 255, 0.6)",
          }}
        />
        {/* Label below marker */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="px-2 py-1 bg-white bg-opacity-90 text-xs font-bold rounded-full shadow-md text-primary">
            {location.title.split(",")[0]}
          </span>
        </div>
      </div>
    </AdvancedMarker>
  );
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
  onFocusFromCluster,
  onMapLoad,
}: HomebaseMapProps) => {
  const { set } = useSelectedMarker();
  const [openInfoWindowId, setOpenInfoWindowId] = useState<number | null>(null);
  const [openClusterId, setOpenClusterId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(4);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [focusedLocation, setFocusedLocation] = useState<Location | null>(null);
  const map = useMap();

  // Notify parent component when map instance is available
  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

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
    // Always compute clusters regardless of zoom level
    return clusterLocations(locations, clusterRadius);
  }, [locations, clusterRadius]);

  // Update clusters when locations, zoom, or clusterRadius changes
  useEffect(() => {
    const newClusters = computeClusters();
    setClusters(newClusters);

    // If changing cluster radius, close any open cluster info windows
    if (openClusterId && newClusters.every(c => c.id !== openClusterId)) {
      setOpenClusterId(null);
    }
  }, [computeClusters, openClusterId]);

  // Update zoom level when map is ready
  useEffect(() => {
    if (map) {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined && currentZoom !== zoom) {
        setZoom(currentZoom);
      }
    }
  }, [map]);

  // Handle location selection from cluster
  const handleLocationSelect = (location: Location) => {
    // Close the cluster info window
    setOpenClusterId(null);

    // Set the selected marker
    set(location);

    // Focus on the selected location
    setFocusedLocation(location);

    // Open the info window for this location
    setOpenInfoWindowId(location.id);

    // Notify parent component of focus state
    if (onFocusFromCluster) {
      onFocusFromCluster(true);
    }

    // Pan and zoom to the location
    if (map) {
      map.panTo(location.position);

      // Only zoom in if we're currently zoomed out
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined && currentZoom < 8) {
        map.setZoom(9);
      }
    }
  };

  // Reset focused location when info window is closed
  useEffect(() => {
    if (openInfoWindowId === null) {
      setFocusedLocation(null);

      // Notify parent component of focus state
      if (onFocusFromCluster) {
        onFocusFromCluster(false);
      }
    }
  }, [openInfoWindowId, onFocusFromCluster]);

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

  // Determine if we should show clusters based on focused state, not zoom level
  const shouldShowClusters = clusters.length > 0 && !focusedLocation;

  // Separate multi-location clusters from single-location clusters
  const multiLocationClusters = clusters.filter(cluster => cluster.count > 1);
  const singleLocationMarkers = clusters.filter(cluster => cluster.count === 1).flatMap(cluster => cluster.locations);

  // Combine individual markers list with single-location clusters
  const individualMarkers = shouldShowClusters ? singleLocationMarkers : locations;

  // If we have a focused location, show only that marker
  const markersToShow = focusedLocation ? [focusedLocation] : individualMarkers;

  return (
    <Map
      style={containerStyle}
      defaultCenter={center}
      defaultZoom={2}
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
      {/* Render multi-location clusters if not focused on a specific location */}
      {shouldShowClusters &&
        multiLocationClusters.map(cluster => (
          <React.Fragment key={cluster.id}>
            <ClusterMarker cluster={cluster} onClick={() => handleClusterClick(cluster)} zoomLevel={zoom} />
            {openClusterId === cluster.id && (
              <ClusterInfoWindow
                cluster={cluster}
                onClose={() => setOpenClusterId(null)}
                onLocationSelect={handleLocationSelect}
              />
            )}
          </React.Fragment>
        ))}

      {/* Render individual markers */}
      {markersToShow.map(marker => (
        <React.Fragment key={marker.id}>
          {focusedLocation && focusedLocation.id === marker.id ? (
            // Show special marker for focused location
            <FocusedLocationMarker
              location={marker}
              onClick={() => {
                set(marker);
                setOpenInfoWindowId(marker.id);
              }}
            />
          ) : (
            // Show regular marker for non-focused locations
            <MarkerWithInfowindow
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
          )}
        </React.Fragment>
      ))}

      {/* Add special marker for focused location with info window */}
      {focusedLocation && openInfoWindowId === focusedLocation.id && (
        <InfoWindow position={focusedLocation.position} onCloseClick={() => setOpenInfoWindowId(null)}>
          {infoWindowChildren(focusedLocation)}
        </InfoWindow>
      )}

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
