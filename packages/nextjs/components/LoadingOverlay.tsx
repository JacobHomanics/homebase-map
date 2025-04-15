import { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingOverlayProps {
  message?: string;
  duration?: number;
}

export const LoadingOverlay = ({ message = "Loading...", duration = 2000 }: LoadingOverlayProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-base-100 bg-opacity-100 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center flex flex-col items-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <Image src="/homebase.jpg" alt="logo" width={100} height={100} className="rounded-full" />
        <p className="text-xl font-semibold">{message}</p>
      </div>
    </div>
  );
};
