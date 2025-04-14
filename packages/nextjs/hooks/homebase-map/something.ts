import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export const useMapHeight = (mobileHeight: number, desktopHeight: number) => {
  const [mapHeight, setMapHeight] = useState(mobileHeight);

  useEffect(() => {
    const handleResize = () => {
      setMapHeight(window.innerWidth < MOBILE_BREAKPOINT ? mobileHeight : desktopHeight);
    };

    // Set initial height
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return mapHeight;
};
