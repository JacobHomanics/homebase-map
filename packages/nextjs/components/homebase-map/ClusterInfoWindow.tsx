import Image from "next/image";
import { InfoWindow } from "@vis.gl/react-google-maps";
import { Location } from "~~/locations.config";
import { Cluster } from "~~/utils/clustering";

interface ClusterInfoWindowProps {
  cluster: Cluster;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
}

export const ClusterInfoWindow = ({ cluster, onClose, onLocationSelect }: ClusterInfoWindowProps) => {
  // Get a representative image for the cluster
  const clusterImage = cluster.locations[0]?.image || "/homebase.jpg";

  return (
    <InfoWindow position={cluster.position} onCloseClick={onClose}>
      <div className="p-4 bg-base-300 rounded-lg max-h-96 overflow-y-auto w-full max-w-xs">
        <div className="flex flex-col items-center mb-4">
          <Image
            width={200}
            height={100}
            className="w-full h-32 object-cover rounded-lg mb-3"
            src={clusterImage}
            alt="Cluster locations"
          />
          <h3 className="text-lg font-bold text-center">{cluster.count} Locations in this area</h3>
          <p className="text-sm text-center mb-3 text-gray-500">Select a location to view details</p>
        </div>

        <div className="space-y-2">
          {cluster.locations.map(location => (
            <div
              key={location.id}
              className="border border-base-200 rounded-md p-3 hover:bg-base-200 transition-all cursor-pointer"
              onClick={() => onLocationSelect(location)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{location.title}</h4>
                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">View</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs">{location.region}</span>
                <span className="text-xs">{location.date}</span>
              </div>
              {location.lumaLink && (
                <div className="mt-2">
                  <a
                    href={location.lumaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent underline block text-center"
                    onClick={e => e.stopPropagation()}
                  >
                    Register on Luma
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </InfoWindow>
  );
};
