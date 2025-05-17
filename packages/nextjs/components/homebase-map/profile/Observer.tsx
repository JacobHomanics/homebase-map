"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import SocialButtons from "./SocialButtons";
import { useReadContract } from "wagmi";
import { HOMEBASE_PROFILE_ADDRESS, abi } from "~~/utils/homebase-profile";

interface ProfileData {
  username: string;
  bio: string;
  skills: string[];
  projects: { name: string; link: string }[];
  profilePicture: string;
  social: {
    github: string | null;
    twitter: string | null;
    farcaster: string | null;
  };
  events: {
    name: string;
    date: string;
    location: string;
  }[];
}

export default function Observer({ user }: { user: string }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const { data: ipfsUrl } = useReadContract({
    address: HOMEBASE_PROFILE_ADDRESS,
    abi,
    functionName: "getUrl",
    args: [user],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (ipfsUrl && typeof ipfsUrl === "string") {
          const response = await fetch(ipfsUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch profile data");
          }
          const data = await response.json();
          // Add mock events data
          data.events = [
            {
              name: "ETHGlobal Lisbon",
              date: "May 24-26, 2024",
              location: "Lisbon, Portugal",
            },
            {
              name: "Devcon Bogotá",
              date: "October 11-14, 2022",
              location: "Bogotá, Colombia",
            },
            {
              name: "ETHGlobal Tokyo",
              date: "April 13-15, 2023",
              location: "Tokyo, Japan",
            },
          ];
          // Remove mock social data and use the data from the profile
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [ipfsUrl]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="max-w-2xl mx-auto p-6 text-center text-red-500">{error}</div>;
  }

  if (!profileData) {
    return <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">No profile data found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
          {profileData.profilePicture ? (
            <Image
              src={`https://ipfs.io/ipfs/${profileData.profilePicture}`}
              alt="Profile"
              className="w-full h-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span>No image</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">Onchain Profile</h1>
          {profileData.username && <p className="text-gray-600">@{profileData.username}</p>}
          <div className="mt-2">
            <SocialButtons
              github={profileData.social.github}
              twitter={profileData.social.twitter}
              farcaster={profileData.social.farcaster}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="text-gray-700">{profileData.bio}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {profileData.skills.map((skill, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {skill}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="space-y-2">
          {profileData.projects.map((project, index) => (
            <div key={index} className="p-3 border rounded-md hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">#{index + 1}</span>
                <div className="relative group">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    {project.name}
                  </a>
                  <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {project.link}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Events Attended</h2>
        <div className="space-y-4">
          {profileData.events.map((event, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{event.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.date}</p>
                </div>
                <div className="text-sm text-gray-500">{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
