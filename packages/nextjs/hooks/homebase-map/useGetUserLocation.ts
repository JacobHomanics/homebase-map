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

  useEffect(() => {
    console.log("Attempting to get geolocation...");

    if ("geolocation" in navigator) {
      // Add loading state while waiting for geolocation
      const timeoutId = setTimeout(() => {
        console.log("Geolocation request timed out");
        // If geolocation takes too long, use default center
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        position => {
          clearTimeout(timeoutId);
          console.log("Position successfully obtained:", position);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setCenter(newLocation);
        },
        error => {
          clearTimeout(timeoutId);
          console.error("Error getting location:", error);
          // Set default location if there's an error
          setUserLocation(defaultCenter);

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
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Set default location if geolocation is not supported
      setUserLocation(null);
      //   setUserLocation(defaultCenter);
    }
  }, []);

  return { userLocation, center };
};
