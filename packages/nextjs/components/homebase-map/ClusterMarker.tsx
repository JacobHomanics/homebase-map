import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Cluster } from "~~/utils/clustering";

interface ClusterMarkerProps {
  cluster: Cluster;
  onClick: () => void;
  zoomLevel?: number;
}

export const ClusterMarker = ({ cluster, onClick, zoomLevel = 4 }: ClusterMarkerProps) => {
  // Only render cluster marker if there's more than one location
  if (cluster.count <= 1) return null;

  // Calculate size based on number of locations in cluster
  const baseSize = 40;
  const size = Math.min(baseSize + cluster.count * 5, 70);

  // Adjust styling based on zoom level
  const isHighZoom = zoomLevel >= 8;

  return (
    <AdvancedMarker position={cluster.position} onClick={onClick}>
      <div
        className="tooltip tooltip-bottom"
        data-tip={isHighZoom ? `Click to view ${cluster.count} clustered locations` : ""}
      >
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            backgroundColor: isHighZoom ? "rgba(0, 82, 255, 0.7)" : "#0052FF",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            border: isHighZoom ? "2px dashed #fff" : "2px solid #fff",
            boxShadow: isHighZoom ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "0 2px 10px rgba(0, 0, 0, 0.3)",
            cursor: "pointer",
            transform: isHighZoom ? "scale(0.9)" : "scale(1)",
            transition: "all 0.3s ease",
          }}
        >
          {cluster.count}
        </div>
      </div>
    </AdvancedMarker>
  );
};
