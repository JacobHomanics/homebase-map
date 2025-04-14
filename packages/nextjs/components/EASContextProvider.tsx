// import { EAS, Offchain, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import React, { createContext, useEffect, useState } from "react";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { Config, UseChainIdParameters, useChainId } from "wagmi";
import easConfig from "~~/EAS.config";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
// import { foundry } from "viem/chains";
import { useEthersSigner } from "~~/utils/useEthersSigner";

const EASContext = createContext({ eas: null as EAS | null, isReady: false });

const EASProvider = ({ children }: { children: React.ReactNode }) => {
  const signer = useEthersSigner();
  const chainId = useChainId(wagmiConfig as UseChainIdParameters<Config>);
  const [eas, setEAS] = useState<EAS | null>(null);
  const [signerReady, setSignerReady] = useState(false);

  useEffect(() => {
    if (!chainId) return;
    // Check if chainId is a key in the easConfig.chains object

    console.log("chainId", chainId);
    const EASContractAddress = easConfig.chains[String(chainId) as keyof typeof easConfig.chains]?.easContractAddress;

    console.log("EASContractAddress", EASContractAddress);
    const newEAS = new EAS(EASContractAddress);

    if (signer) {
      newEAS.connect(signer);
    }

    setEAS(newEAS);
    setSignerReady(false);

    signer?.provider
      .getSigner()
      .then(() => {
        signer && newEAS.connect(signer);
        setSignerReady(true);
      })
      .catch(err => console.log("[🧪 DEBUG — EAS.connect(signer)](err):", err));
  }, [chainId, signer]);

  return <EASContext.Provider value={{ eas, isReady: signerReady }}>{children}</EASContext.Provider>;
};

export { EASContext, EASProvider };
