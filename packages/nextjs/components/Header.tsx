"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseUnits } from "viem";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Tutorial } from "~~/components/Tutorial";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAttestLocation } from "~~/hooks/homebase-map/useAttestLocation";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Map",
    href: "/",
  },
  // {
  //   label: "Charts",
  //   href: "/charts",
  // },
  // {
  //   label: "Debug Contracts",
  //   href: "/debug",
  //   icon: <BugAntIcon className="h-4 w-4" />,
  // },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

interface FindMyLocationButtonProps {
  requestUserLocation: () => void;
}

export const FindMyLocationButton = ({ requestUserLocation }: FindMyLocationButtonProps) => {
  return (
    <button className="btn btn-primary btn-sm mr-2" onClick={requestUserLocation}>
      Find your homebase
    </button>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { handleSubmit: attestLocation } = useAttestLocation();

  const setUserLocation = useGlobalState(state => state.setUserLocation);

  function scaleCoordinates(latitude: number, longitude: number, scale: number) {
    return {
      lat: parseUnits(latitude.toString(), scale),
      lng: parseUnits(longitude.toString(), scale),
    };
  }

  async function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ lat: latitude, lng: longitude });
        const scaledCoordinates = scaleCoordinates(latitude, longitude, 9);

        const newAttestationUID = await attestLocation(scaledCoordinates);
        console.log("newAttestationUID", newAttestationUID);
      });
    }
  }

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleLocationConfirm = () => {
    closeLocationModal();
    getUserLocation();
  };

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="flex items-center ml-2 mr-2">
          <Tutorial />
        </div>
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image
              alt="SE2 logo"
              className="cursor-pointer"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src="/base-world.png"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Homebase</span>
            <span className="text-xs">{"Community-driven, onchain check-in app"}</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <button className="btn btn-primary btn-sm mr-2" onClick={openLocationModal}>
          Find your homebase
        </button>

        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>

      {/* Location Confirmation Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-base-100 p-6 rounded-lg max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-3 text-center">Share Your Location</h3>
            <div className="divider my-1"></div>
            <div className="space-y-3 my-4">
              <p className="text-sm">We&apos;ll need to:</p>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li>Access your current location</li>
                <li>Create a blockchain record of where you are</li>
              </ul>
              <p className="text-sm italic mt-2">
                This step is optional, however it may be referenced at a later time to verify your attendance at the
                event.
              </p>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <button className="btn btn-outline btn-sm" onClick={closeLocationModal}>
                Not Now
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleLocationConfirm}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
