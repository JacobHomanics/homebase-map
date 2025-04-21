import { useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
}

const defaultCenter = {
  lat: 39.78597,
  lng: -101.58847,
};

export const useGetUserLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [isManualMode, setIsManualMode] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      console.log("Geolocation is not supported by this browser.");
      setHasPermission(false);
      return;
    }

    console.log("Requesting geolocation permission...");

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log("Position successfully obtained:", position);
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setCenter(newLocation);
        setHasPermission(true);
      },
      error => {
        console.error("Error getting location:", error);
        setHasPermission(false);

        // Handle specific error codes
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for geolocation");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out");
            break;
          default:
            console.log("An unknown error occurred");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      },
    );
  };

  // Function to manually set user location
  const setManualLocation = (location: UserLocation) => {
    setUserLocation(location);
    setCenter(location);
  };

  // Toggle between automatic and manual location modes
  const toggleManualMode = () => {
    setIsManualMode(prev => !prev);
  };

  return {
    userLocation,
    center,
    isManualMode,
    hasPermission,
    setManualLocation,
    toggleManualMode,
    requestLocation,
  };
};
