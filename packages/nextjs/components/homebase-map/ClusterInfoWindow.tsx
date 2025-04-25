import { InfoWindow } from "@vis.gl/react-google-maps";
import { Cluster } from "~~/utils/clustering";

interface ClusterInfoWindowProps {
  cluster: Cluster;
  onClose: () => void;
  renderLocation: (locationId: number) => React.ReactNode;
}

export const ClusterInfoWindow = ({ cluster, onClose, renderLocation }: ClusterInfoWindowProps) => {
  return (
    <InfoWindow position={cluster.position} onCloseClick={onClose}>
      <div className="p-4 bg-base-300 rounded-lg max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-3 text-center">{cluster.count} Locations in this area</h3>
        <div className="space-y-4">
          {cluster.locations.map(location => (
            <div key={location.id} className="border-b border-base-200 pb-4 last:border-b-0">
              {renderLocation(location.id)}
            </div>
          ))}
        </div>
      </div>
    </InfoWindow>
  );
};
