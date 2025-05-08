# Homebase Map Project Scratchpad

## Background and Motivation
The Homebase Map is a dApp built on Scaffold-ETH 2 that displays global workshop events for Base Batch Workshops, with NFT contracts for each location. The system allows users to check in to workshops, but there are currently issues with the check-in functionality.

## Key Challenges and Analysis
1. **Wallet Network Switching Issue**: When using Coinbase wallet, users receive an error "Wallet is connected to the wrong network. Please switch to Base" but there's no button to change the network.
   - The app uses RainbowKit's `useSwitchChain` hook in `NetworkOptions.tsx` to handle network switching
   - The "Wrong network" dropdown in `WrongNetworkDropdown.tsx` should show options to switch networks
   - Coinbase Wallet appears to have limitations with the automatic network switching mechanism
   - **Solution Implemented**: Added a special notification for Coinbase Wallet users with instructions on how to manually switch networks

2. **Confusing Token Ticker**: When checking into Lisbon, the mint transaction shows "$LAGOS" as the ticker, which is confusing for users.
   - In the deployment script (`DeployYourContract.s.sol`), Lisbon contract is correctly deployed with symbol "LISBON"
   - Lagos contract is deployed with the symbol "LAGOS" 
   - **Found the root cause**: There's a mismatch between location IDs in `locations.config.ts` and the `nftWriteMapping` array in `Map.tsx`
   - In `locations.config.ts`, Lisbon is assigned ID 19, but in the `nftWriteMapping` array, `writeLagosAsync` was at index 19, while `writeLisbonAsync` was at index 21
   - When a user clicks "Check in" on Lisbon, the code calls `nftWriteMapping[selectedMarker?.id ?? 0]`, which was using the Lagos contract instead of the Lisbon contract
   - **Solution Implemented**: Fixed the `nftWriteMapping` array to correctly align with location IDs in `locations.config.ts`

3. **Contract Verification**: The contract is currently unverified on BaseScan: https://basescan.org/address/0x2f97842B9775Ee8C6968e57BA8D783A6697d5FE5
   - Contract verification would provide transparency for users who want to review the code before interacting with it
   - This is recommended but not critical for functionality

## High-level Task Breakdown
1. **Investigate Network Switching Issue**: ✅
   - Review the RainbowKit and Coinbase Wallet integration ✅
   - Determine how to provide clearer instructions for manually switching networks in Coinbase Wallet ✅
   - Implemented a special notification for Coinbase Wallet users ✅

2. **Fix Incorrect Token Symbol Issue**: ✅
   - Update the `nftWriteMapping` array in `Map.tsx` to correctly match the location IDs in `locations.config.ts` ✅
   - Ensure the Lisbon location maps to the correct Lisbon contract ✅
   - Fixed the ordering of contract function mappings to align with location IDs ✅

3. **Contract Verification**:
   - Check if the deployment process includes contract verification
   - Determine steps needed to verify the contract on BaseScan

## Project Status Board
- [x] Investigate wallet network switching issue in Coinbase wallet
- [x] Investigate why Lisbon check-in shows $LAGOS ticker
- [ ] Verify the contract on BaseScan if appropriate
- [x] Fix the token mismatch issue in the Map component
- [x] Add better guidance for Coinbase Wallet users

## Current Status / Progress Tracking
- Successfully identified and fixed the root cause of the token ticker issue by aligning the `nftWriteMapping` array with location IDs
- Added a clear notification for Coinbase Wallet users with instructions on how to manually switch networks
- Both issues are now resolved and the application should function correctly

## Executor's Feedback or Assistance Requests
Changes completed:
1. Fixed the `nftWriteMapping` array in `Map.tsx` to correctly match location IDs with their corresponding contract write functions:
   - Lisbon (ID 19) now correctly maps to `writeLisbonAsync`
   - Lagos was moved to ID 49 to match the actual deployment
   - All other locations were also updated to match their IDs

2. Added a special notification for Coinbase Wallet users in `WrongNetworkDropdown.tsx`:
   - Detects if the user is using Coinbase Wallet
   - Shows a clear message about how to manually switch networks in wallet settings

Remaining tasks:
- If contract verification is required, this could be addressed in a future update

## Lessons
- Always ensure array indices match configuration IDs, especially when using them as direct lookup keys
- When third-party integrations have limitations (like Coinbase Wallet's network switching), provide clear user instructions
- Better to test with multiple wallet providers before releasing to production 