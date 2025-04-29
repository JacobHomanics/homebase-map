"use client";

import Observer from "./Observer";
import Owner from "./Owner";
import { useAccount } from "wagmi";

export default function Profile({ user }: { user: string }) {
  const account = useAccount();

  const isOwner = account.address === user;

  return isOwner ? <Owner user={user} /> : <Observer user={user} />;
}
