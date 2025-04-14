import { NextResponse } from "next/server";
import { attestLocation } from "../shared/location";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

// Store topics, opinions, and user-trained data in-memory for simplicity
// In production, use a database like MongoDB, Redis, etc.

export async function POST(request: Request) {
  async function getLocationProofs() {
    try {
      // Get all location proofs
      const response = await fetch("https://api.astral.global/api/v0/location-proofs");
      const data = await response.json();
      //   console.log(`Found ${data.count} location proofs`);
      //   console.log(data.data);
    } catch (error) {
      console.error("Error fetching location proofs:", error);
    }
  }

  getLocationProofs();

  try {
    const { password, userAddress, location } = await request.json();

    const result = await attestLocation(userAddress);
    console.log(result);

    // // Create wallet client with private key
    // // IMPORTANT: Store this in an environment variable in production
    // const privateKey = process.env.ADMIN_PRIVATE_KEY; // Replace with your private key or use env var
    // const account = privateKeyToAccount(privateKey as `0x${string}`);

    // const client = createWalletClient({
    //   account,
    //   chain: foundry, // Change to your desired chain
    //   transport: http(), // You may want to specify an RPC URL here
    // });

    // const contractInfo = deployedContracts[31337].AlignmentManagerV1;

    // if (!contractInfo) {
    //   return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    // }

    // // console.log(contractInfo);
    // // console.log(userAddress);
    // // console.log(location);
    // client.writeContract({
    //   address: contractInfo?.address,
    //   abi: contractInfo?.abi,
    //   functionName: "addAlignment",
    //   args: [location, userAddress],
    // });

    // Return transaction result or other data
    return NextResponse.json({
      message: "Alignment succesfully added!",
      // txHash: result // Uncomment when using actual contract interaction
    });
  } catch (error) {
    console.error("Error in pledge API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
