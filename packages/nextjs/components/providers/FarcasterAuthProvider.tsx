"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";

const config = {
  rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
  siweUri: process.env.NEXT_PUBLIC_SIWE_URI || "http://localhost:3000",
};

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>;
}
