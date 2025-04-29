"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";
import { RootABI } from "~~/utils/jackal/bridgeAbi";

export default function Owner({ user }: { user: string }) {
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const githubConnectedParam = searchParams.get("github_connected");
    const githubUsernameParam = searchParams.get("github_username");

    if (githubConnectedParam === "true" && githubUsernameParam) {
      setGithubConnected(true);
      setGithubUsername(githubUsernameParam);
    }
  }, [searchParams]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (currentSkill && skills.length < 3) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill("");
    }
  };

  const addProject = () => {
    if (currentProject) {
      setProjects([...projects, currentProject]);
      setCurrentProject("");
    }
  };

  const handleGithubConnect = async () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const scope = "read:user user:email";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Complete Your Profile</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span>No image</span>
              </div>
            )}
          </div>
          <div>
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">JPG, PNG or GIF. Max size of 2MB</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Connect Your Accounts</h2>
        <div className="flex flex-col gap-4">
          <button className="w-full px-4 py-2 border rounded-md hover:bg-gray-100">Connect Farcaster</button>
          <button className="w-full px-4 py-2 border rounded-md hover:bg-gray-100">Connect Twitter</button>
          <button
            onClick={handleGithubConnect}
            className={`w-full px-4 py-2 border rounded-md ${
              githubConnected ? "bg-green-100 text-green-700 border-green-300" : "hover:bg-gray-100"
            }`}
          >
            {githubConnected ? `Connected to GitHub as ${githubUsername}` : "Connect GitHub"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">About You</h2>
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            placeholder="What skills are you looking to use and what are you working or interested to work on"
            value={bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
            className="min-h-[100px] w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputBase placeholder="Add a skill" value={currentSkill} onChange={setCurrentSkill} />
          </div>
          <button
            onClick={addSkill}
            disabled={skills.length >= 3}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: string, index: number) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {skill}
              <button
                onClick={() => setSkills(skills.filter((_: string, i: number) => i !== index))}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">Add 1-3 skills for better results on basematch.xyz</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputBase placeholder="Add a link to your work" value={currentProject} onChange={setCurrentProject} />
          </div>
          <button onClick={addProject} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Add
          </button>
        </div>
        <div className="space-y-2">
          {projects.map((project: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">#{index + 1}</span>
                <a
                  href={project}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline truncate max-w-[400px]"
                >
                  {project}
                </a>
              </div>
              <button
                onClick={() => setProjects(projects.filter((_: string, i: number) => i !== index))}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Profile</button>
    </div>
  );
}
