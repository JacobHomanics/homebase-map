import "@rainbow-me/rainbowkit/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { FarcasterAuthProvider } from "~~/components/providers/FarcasterAuthProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({ title: "Homebase", description: "Community-driven, onchain check-in app." });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider forcedTheme="light">
          <FarcasterAuthProvider>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </FarcasterAuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
