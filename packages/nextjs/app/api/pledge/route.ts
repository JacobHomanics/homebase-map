import { NextResponse } from "next/server";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { locations } from "~~/locations.config";
import { DEFAULT_RANGE_METERS } from "~~/utils/distance";
import { isWithinRange } from "~~/utils/distance";

const account = privateKeyToAccount(process.env.ADMIN_PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

export async function POST(request: Request) {
  try {
    const { password, userAddress, location: userLocation, locationId } = await request.json();

    const selectedLocation = locations.find(location => location.id === locationId);

    if (!selectedLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 400 });
    }

    const isInRange = isWithinRange(
      userLocation?.lat,
      userLocation?.lng,
      selectedLocation?.position.lat,
      selectedLocation?.position.lng,
      DEFAULT_RANGE_METERS,
    );

    if (!isInRange) {
      return NextResponse.json({ error: "You are not in range of this location" }, { status: 400 });
    }

    const nfts = [
      deployedContracts[base.id].Brussels,
      deployedContracts[base.id].Gosho,
      deployedContracts[base.id].Yogyakarta,
      deployedContracts[base.id].Ndotohub,
    ];

    const nft = nfts[locationId];

    const result = await client.writeContract({
      address: nft.address,
      abi: nft.abi,
      functionName: "mint",
      args: [userAddress],
    });

    return NextResponse.json({
      message: "Alignment successfully added!",
      hash: result,
    });
  } catch (error) {
    console.error("Error in pledge API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
