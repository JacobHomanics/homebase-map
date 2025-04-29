import { use } from "react";

type UserParams = {
  user: string;
};

type PageProps = {
  params: Promise<UserParams>;
};

export default function UserPage({ params }: PageProps) {
  const { user } = use(Promise.resolve(params));
  return <p>{user}</p>;
}
