"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SignInButton, useProfile } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth/Input/InputBase";
import { HOMEBASE_PROFILE_ADDRESS, abi } from "~~/utils/homebase-profile";
import { notification } from "~~/utils/scaffold-eth";

export default function Owner({ user }: { user: string }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [projects, setProjects] = useState<{ name: string; link: string }[]>([]);
  const [currentProject, setCurrentProject] = useState("");
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [editingProjectLink, setEditingProjectLink] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureIpfsHash, setProfilePictureIpfsHash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [farcasterConnected, setFarcasterConnected] = useState(false);
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { writeContract, writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { isAuthenticated, profile } = useProfile();

  const { data: ipfsUrl } = useReadContract({
    address: HOMEBASE_PROFILE_ADDRESS,
    abi,
    functionName: "getUrl",
    args: [address],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      console.log("Fetching...");
      try {
        setIsLoading(true);
        if (ipfsUrl && typeof ipfsUrl === "string") {
          const response = await fetch(ipfsUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch profile data");
          }
          const profileData = await response.json();

          // Update state with fetched data
          setUsername(profileData.username || "");
          setBio(profileData.bio || "");
          setSkills(profileData.skills || []);
          setProjects(profileData.projects || []);
          setProfilePictureIpfsHash(profileData.profilePicture);

          // Set social connections
          if (profileData.social) {
            if (profileData.social.github) {
              setGithubConnected(true);
              setGithubUsername(profileData.social.github);
            }
            if (profileData.social.twitter) {
              setTwitterConnected(true);
              setTwitterUsername(profileData.social.twitter);
            }
            if (profileData.social.farcaster) {
              setFarcasterConnected(true);
              setFarcasterUsername(profileData.social.farcaster);
            }
          }

          // Load profile picture if available
          if (profileData.profilePicture) {
            setProfilePicture(`https://ipfs.io/ipfs/${profileData.profilePicture}`);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }

      console.log("Fetched");
    };

    fetchProfileData();
  }, [ipfsUrl]);

  useEffect(() => {
    const githubConnectedParam = searchParams.get("github_connected");
    const githubUsernameParam = searchParams.get("github_username");
    const twitterConnectedParam = searchParams.get("twitter_connected");
    const twitterUsernameParam = searchParams.get("twitter_username");
    const farcasterConnectedParam = searchParams.get("farcaster_connected");
    const farcasterUsernameParam = searchParams.get("farcaster_username");

    if (githubConnectedParam === "true" && githubUsernameParam) {
      setGithubConnected(true);
      setGithubUsername(githubUsernameParam);
    }

    if (twitterConnectedParam === "true" && twitterUsernameParam) {
      setTwitterConnected(true);
      setTwitterUsername(twitterUsernameParam);
    }

    if (farcasterConnectedParam === "true" && farcasterUsernameParam) {
      setFarcasterConnected(true);
      setFarcasterUsername(farcasterUsernameParam);
    }
  }, [searchParams]);

  // Update Farcaster state when AuthKit profile changes
  useEffect(() => {
    if (isAuthenticated && profile?.username) {
      setFarcasterConnected(true);
      setFarcasterUsername(profile.username || null);
    } else {
      setFarcasterConnected(false);
      setFarcasterUsername(null);
    }
  }, [isAuthenticated, profile]);

  const uploadToPinata = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pinata/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload to Pinata");
      }

      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      setUploadError("Failed to upload image. Please try again.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // First show the preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicture(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Then upload to Pinata
        const ipfsHash = await uploadToPinata(file);
        setProfilePictureIpfsHash(ipfsHash);
        console.log("Profile picture uploaded to Pinata with IPFS hash:", ipfsHash);
      } catch (error) {
        console.error("Error handling profile picture:", error);
      }
    }
  };

  const saveProfile = async () => {
    if (!profilePictureIpfsHash) {
      setUploadError("Please upload a profile picture");
      return;
    }

    if (!publicClient) {
      setUploadError("Public client not available");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const profileData = {
        name: "Homebase Profile",
        description: bio || "Homebase profile for web3 collaboration",
        image: `https://ipfs.io/ipfs/${profilePictureIpfsHash}`,
        external_url: "https://homebase.xyz",
        attributes: [
          {
            trait_type: "Username",
            value: username,
          },
          {
            trait_type: "Skills",
            value: skills,
          },
          {
            trait_type: "Projects",
            value: projects.map(p => p.name),
          },
          {
            trait_type: "Project Links",
            value: projects.map(p => p.link),
          },
          {
            trait_type: "Social",
            value: {
              github: githubConnected ? githubUsername : null,
              twitter: twitterConnected ? twitterUsername : null,
              farcaster: farcasterConnected ? farcasterUsername : null,
            },
          },
        ],
        // Preserve the original data structure for backward compatibility
        username,
        bio,
        skills,
        projects,
        profilePicture: profilePictureIpfsHash,
        social: {
          github: githubConnected ? githubUsername : null,
          twitter: twitterConnected ? twitterUsername : null,
          farcaster: farcasterConnected ? farcasterUsername : null,
        },
      };

      // Upload the complete profile metadata to Pinata
      const response = await fetch("/api/pinata/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      const data = await response.json();
      console.log("Profile saved with IPFS hash:", data.IpfsHash);

      // Write the IPFS URL to the smart contract
      const ipfsUrl = `https://ipfs.io/ipfs/${data.IpfsHash}`;
      const hash = await writeContractAsync({
        address: HOMEBASE_PROFILE_ADDRESS,
        abi,
        functionName: "setUrl",
        args: [ipfsUrl],
      });

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        notification.success("Profile saved successfully!");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      console.log(error);

      setUploadError("Failed to save profile. Please try again.");
      notification.error("Failed to save profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const addSkill = () => {
    if (currentSkill && skills.length < 3) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill("");
    }
  };

  const addProject = () => {
    if (currentProject && currentProjectName) {
      setProjects([...projects, { name: currentProjectName, link: currentProject }]);
      setCurrentProject("");
      setCurrentProjectName("");
    }
  };

  const handleGithubConnect = async () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const scope = "read:user user:email";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = githubAuthUrl;
  };

  const handleTwitterConnect = async () => {
    const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/auth/twitter/callback`;
    const scope = "tweet.read users.read";
    const state = Math.random().toString(36).substring(7);
    const codeChallenge = Math.random().toString(36).substring(7);

    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=plain`;
    window.location.href = twitterAuthUrl;
  };

  const handleEditProject = (index: number) => {
    setEditingProjectIndex(index);
    setEditingProjectName(projects[index].name);
    setEditingProjectLink(projects[index].link);
  };

  const saveEditedProject = () => {
    if (editingProjectIndex !== null && editingProjectLink && editingProjectName) {
      const updatedProjects = [...projects];
      updatedProjects[editingProjectIndex] = { name: editingProjectName, link: editingProjectLink };
      setProjects(updatedProjects);
      setEditingProjectIndex(null);
      setEditingProjectName("");
      setEditingProjectLink("");
    }
  };

  const cancelEdit = () => {
    setEditingProjectIndex(null);
    setEditingProjectName("");
    setEditingProjectLink("");
  };

  const handleFarcasterSignOut = () => {
    setFarcasterConnected(false);
    setFarcasterUsername(null);
    // The actual sign out will be handled by the Farcaster Auth Kit's internal state
    notification.success("Successfully signed out from Farcaster");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Complete Your Profile</h1>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Username</h2>
        <div>
          <InputBase placeholder="Choose a username" value={username} onChange={setUsername} />
          <p className="mt-1 text-sm text-gray-500">This will be your unique identifier on Homebase</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {profilePicture ? (
              <Image src={profilePicture} alt="Profile" className="w-full h-full object-cover" width={96} height={96} />
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
                disabled={isUploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
            <p className="mt-1 text-sm text-gray-500">JPG, PNG or GIF. Max size of 2MB</p>
            {isUploading && <p className="mt-1 text-sm text-blue-500">Uploading...</p>}
            {uploadError && <p className="mt-1 text-sm text-red-500">{uploadError}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Connect Your Accounts</h2>
        <div className="flex flex-col gap-4">
          <SignInButton
            onSuccess={obj => {
              if (username) {
                notification.success(`Connected to Farcaster as ${username}`);
              }
            }}
            onError={error => {
              if (error?.message) {
                notification.error(`Failed to connect to Farcaster: ${error.message}`);
              } else {
                notification.error("Failed to connect to Farcaster");
              }
            }}
          />

          {/* {!farcasterConnected && !farcasterUsername && (
           
          )} */}

          {/* {farcasterConnected && farcasterUsername && (
            <div className="flex items-center justify-between p-3 border rounded-md bg-[#7c65c1]">
              <div className="flex items-center gap-3">
                <Image
                  src={profile.pfpUrl || "/default-avatar.png"}
                  alt={`${farcasterUsername}'s Farcaster profile`}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                />
                <div className="flex items-center gap-2">
                  <Image
                    src="/farcaster-brand-main/icons/icon-transparent/transparent-white.svg"
                    alt="Warpcast logo"
                    className="w-10 h-10"
                    width={40}
                    height={40}
                  />
                  <span className="font-medium text-white">@{farcasterUsername}</span>
                </div>
              </div>
              <button
                onClick={handleFarcasterSignOut}
                className="px-4 py-2 text-sm text-white hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          )} */}
          <button
            onClick={handleTwitterConnect}
            className={`w-full px-4 py-2 border rounded-md ${
              twitterConnected ? "bg-green-100 text-green-700 border-green-300" : "hover:bg-gray-100"
            }`}
          >
            {twitterConnected ? `Connected to Twitter as ${twitterUsername}` : "Connect Twitter"}
          </button>
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
        <p className="text-sm text-gray-500">
          Add at least 1-3 skills. The more skills you add, the more accurate matching will be.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <InputBase placeholder="Project name" value={currentProjectName} onChange={setCurrentProjectName} />
            </div>
            <div className="flex-1">
              <InputBase placeholder="Project link" value={currentProject} onChange={setCurrentProject} />
            </div>
            <button onClick={addProject} className="px-4 py-2 bg-blue-500 text-white rounded-md">
              Add
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
              {editingProjectIndex === index ? (
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <InputBase placeholder="Project name" value={editingProjectName} onChange={setEditingProjectName} />
                  </div>
                  <div className="flex-1">
                    <InputBase placeholder="Project link" value={editingProjectLink} onChange={setEditingProjectLink} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEditedProject}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(index)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={isUploading || !profilePictureIpfsHash}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isUploading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
