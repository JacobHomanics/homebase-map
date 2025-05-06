# 🏠 Homebase Map: Base Batch Workshops DApp

## Overview
Homebase Map is a full-stack decentralized application for powering Base Batch Workshops on the Base (Layer 2) network. It combines:

- A global interactive map of upcoming and past workshops.
- On-chain attendance attestation via EAS (Ethereum Attestation Service).
- Location-specific attendance NFTs built on a shared ERC721 base contract (`NFTBaseV1`).

This monorepo provides everything you need to define event locations, generate and deploy smart contracts, and run the Next.js frontend UI.

## Monorepo Structure

- **packages/foundry**:  
  - Solidity smart contracts, including the base `NFTBaseV1.sol` and auto-generated event contracts in `contracts/events`.  
  - Foundry configuration, tests, and deployment scripts (`scripts-js/`).

- **packages/nextjs**:  
  - Next.js App Router frontend under `app/`, including the `Map` component (`components/Map.tsx`) that renders a Google Map with clustering.  
  - Hooks for blockchain interactions (`useAttestLocation`, `useScaffoldReadContract`, `useScaffoldWriteContract`, etc.).  
  - Event definitions and metadata in `locations.config.ts` and pre-built components for addresses, balances, and inputs.

- **nft-metadata**:  
  - JSON templates for event NFT metadata (e.g., `brussels.json`, `yogyakarta.json`).  

- **create_location_contracts.js**:  
  - Node script that reads `packages/nextjs/locations.config.ts` and generates event-specific `.sol` contracts in `packages/foundry/contracts/events`.

- **debug/**:  
  - Utility scripts for parsing location data, testing contract outputs, and validating attestation formats.

## Prerequisites

- **Node.js** >= v20.18.3  
- **Yarn** (v1 or v2+)  
- **Git**

## Setup & Workflow

1. **Clone & install dependencies**
   ```bash
   git clone <repo-url>
   cd <repo-directory>
   yarn install
   ```

2. **Generate event contracts**
   ```bash
   node create_location_contracts.js
   ```
   This creates `.sol` files for each event in `packages/foundry/contracts/events` based on your `locations.config.ts`.

3. **Run local blockchain**
   ```bash
   yarn chain
   ```

4. **Deploy contracts**
   ```bash
   yarn deploy
   ```

5. **Start the frontend**
   ```bash
   yarn start
   ```
   Open your browser at `http://localhost:3000` to explore the map, connect your wallet, attest attendance, and mint event NFTs.

## Testing & Quality

- **Solidity tests (Foundry)**:
  ```bash
  yarn foundry:test
  ```

- **Frontend lint & type-check**:
  ```bash
  yarn lint
  yarn next:check-types
  ```

## How It Works

1. **Define Events**: `packages/nextjs/locations.config.ts` lists each workshop's ID, latitude/longitude, title, image, and (deployed) contract address.
2. **Generate Contracts**: `create_location_contracts.js` reads the config and produces Solidity contracts inheriting `NFTBaseV1` for each event.
3. **Deploy**: Contracts are compiled and deployed via Foundry to your local or live network.
4. **Frontend Map**: The `Map` component clusters event markers on Google Maps; clicking a marker opens a detail panel.
5. **Attestation & Minting**: Users connect via RainbowKit, optionally attest location via EAS, then mint an attendance NFT using scaffold-eth's `useScaffoldWriteContract` hooks.

## Configuration

- **Events**: Add, remove, or update events in `packages/nextjs/locations.config.ts`, then rerun `create_location_contracts.js`.
- **Metadata**: Edit or add JSON files in `nft-metadata/` and configure base URI in `NFTBaseV1.sol`.
- **UI**: Customize styles in `packages/nextjs/styles` or modify components under `packages/nextjs/components`.

## Useful Commands

```bash
# Blockchain & Contracts
yarn chain                   # Start local Foundry network
yarn deploy                  # Compile & deploy Solidity contracts

# Frontend
yarn start                   # Run Next.js development server

yarn foundry:test             # Run Solidity tests
yarn lint                     # Lint both contracts & UI
yarn next:check-types         # Type-check frontend code

# Utilities
node create_location_contracts.js  # Regenerate event contracts
yarn format                  # Format all codebases
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for design patterns, coding standards, and pull request guidelines.

---

Happy hacking and see you on-chain! 🚀