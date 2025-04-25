import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Cluster } from "~~/utils/clustering";

interface ClusterMarkerProps {
  cluster: Cluster;
  onClick: () => void;
}

export const ClusterMarker = ({ cluster, onClick }: ClusterMarkerProps) => {
  // Calculate size based on number of locations in cluster
  const baseSize = 40;
  const size = Math.min(baseSize + cluster.count * 5, 70);

  return (
    <AdvancedMarker position={cluster.position} onClick={onClick}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: "#0052FF",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          border: "2px solid #fff",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
        }}
      >
        {cluster.count}
      </div>
    </AdvancedMarker>
  );
};
