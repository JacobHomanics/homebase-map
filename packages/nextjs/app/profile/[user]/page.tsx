import { use } from "react";
import Profile from "~~/components/homebase-map/profile/Profile";

type UserParams = {
  user: string;
};

type PageProps = {
  params: Promise<UserParams>;
};

export default function UserPage({ params }: PageProps) {
  const { user } = use(Promise.resolve(params));

  return <Profile user={user} />;
}
