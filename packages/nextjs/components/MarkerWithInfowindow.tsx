import React from "react";
import Image from "next/image";
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";

export const MarkerWithInfowindow = ({
  children,
  position,
  onClick,
  isOpen,
  onClose,
  image,
}: {
  children: React.ReactNode;
  position: { lat: number; lng: number };
  onClick: () => void;
  isOpen: boolean;
  onClose: () => void;
  image: string;
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        onClick={onClick}
        position={position}
        title={"AdvancedMarker that opens an Infowindow when clicked."}
      >
        <Image width={"400"} height={"400"} className="w-14 h-14 rounded-full" src={image} alt="Location" />
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow anchor={marker} onCloseClick={onClose}>
          {children}
        </InfoWindow>
      )}
    </>
  );
};
