import React, { useState } from "react";
import Image from "next/image";
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";

export const MarkerWithInfowindow = ({
  children,
  position,
  onClick,
}: {
  children: React.ReactNode;
  position: { lat: number; lng: number };
  onClick: () => void;
}) => {
  const [infowindowOpen, setInfowindowOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onClick={() => {
          onClick();
          setInfowindowOpen(true);
        }}
        position={position}
        title={"AdvancedMarker that opens an Infowindow when clicked."}
      >
        <Image width={"400"} height={"400"} className="w-10 h-10" src="/homebase.jpg" alt="Location" />
      </AdvancedMarker>
      {infowindowOpen && (
        <InfoWindow anchor={marker} maxWidth={200} onCloseClick={() => setInfowindowOpen(false)}>
          {children}
        </InfoWindow>
      )}
    </>
  );
};
