import { calculateDistance } from "./distance";
import { Location } from "~~/locations.config";

export interface Cluster {
  id: string;
  locations: Location[];
  position: { lat: number; lng: number };
  count: number;
}

/**
 * Clusters locations that are within a specified radius of each other
 * @param locations Array of locations to cluster
 * @param radiusInMeters Maximum distance between locations to be considered in the same cluster
 * @returns Array of clusters, each containing one or more locations
 */
export function clusterLocations(locations: Location[], radiusInMeters: number): Cluster[] {
  if (!locations.length) return [];

  const clusters: Cluster[] = [];
  const processedIds = new Set<number>();

  // Process each location
  for (let i = 0; i < locations.length; i++) {
    const currentLocation = locations[i];

    // Skip if already processed
    if (processedIds.has(currentLocation.id)) continue;

    // Mark as processed
    processedIds.add(currentLocation.id);

    // Find all locations within radius
    const clusterLocations: Location[] = [currentLocation];
    const { lat, lng } = currentLocation.position;

    // Check all other locations for proximity
    for (let j = 0; j < locations.length; j++) {
      if (i === j) continue; // Skip self

      const otherLocation = locations[j];
      if (processedIds.has(otherLocation.id)) continue; // Skip if already processed

      // Check distance
      const distance = calculateDistance(lat, lng, otherLocation.position.lat, otherLocation.position.lng);

      // Add to cluster if within radius
      if (distance <= radiusInMeters) {
        clusterLocations.push(otherLocation);
        processedIds.add(otherLocation.id);
      }
    }

    // Calculate centroid for cluster
    const centerPosition = calculateClusterCenter(clusterLocations);

    // Create the cluster (even if it's just a single location)
    clusters.push({
      id: `cluster-${currentLocation.id}`,
      locations: clusterLocations,
      position: centerPosition,
      count: clusterLocations.length,
    });
  }

  return clusters;
}

/**
 * Calculates the center point (centroid) of a cluster
 * @param locations Array of locations in the cluster
 * @returns Average lat/lng position as the center
 */
function calculateClusterCenter(locations: Location[]): { lat: number; lng: number } {
  if (!locations.length) {
    return { lat: 0, lng: 0 };
  }

  // If there's only one location, just use its position
  if (locations.length === 1) {
    return { ...locations[0].position };
  }

  let totalLat = 0;
  let totalLng = 0;

  locations.forEach(location => {
    totalLat += location.position.lat;
    totalLng += location.position.lng;
  });

  return {
    lat: totalLat / locations.length,
    lng: totalLng / locations.length,
  };
}
