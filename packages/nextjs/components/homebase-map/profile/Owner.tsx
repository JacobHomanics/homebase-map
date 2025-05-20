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
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [twitterUsername, setTwitterUsername] = useState<string>("");
  const [farcasterUsername, setFarcasterUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [talentScore, setTalentScore] = useState<number | null>(null);
  const [talentScoreLoading, setTalentScoreLoading] = useState(false);
  const [talentScoreError, setTalentScoreError] = useState<string | null>(null);
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

          // Set social usernames
          if (profileData.social) {
            setGithubUsername(profileData.social.github || "");
            setTwitterUsername(profileData.social.twitter || "");
            setFarcasterUsername(profileData.social.farcaster || "");
          }

          // Load profile picture if available
          if (profileData.profilePicture) {
            setProfilePicture(`https://ipfs.io/ipfs/${profileData.profilePicture}`);
          }

          // Fetch Talent Protocol score if we have addresses or usernames
          if (address || profileData.social?.github || profileData.social?.farcaster) {
            fetchTalentScore(address, profileData.social?.github, profileData.social?.farcaster);
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
  }, [ipfsUrl, address]);

  const fetchTalentScore = async (walletAddress?: string, githubUser?: string, farcasterUser?: string) => {
    setTalentScoreLoading(true);
    setTalentScoreError(null);

    try {
      const queryParams = new URLSearchParams();
      let accountSource = "";
      let id = "";

      if (walletAddress) {
        id = walletAddress;
        accountSource = "wallet";
      } else if (farcasterUser) {
        id = farcasterUser;
        accountSource = "farcaster";
      } else if (githubUser) {
        id = githubUser;
        accountSource = "github";
      } else {
        throw new Error("No valid identifier found for Talent Protocol score");
      }

      queryParams.append("id", id);
      queryParams.append("account_source", accountSource);

      const response = await fetch(`/api/talent-protocol/score?${queryParams.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch talent score: ${response.statusText}`);
      }

      const data = await response.json();
      setTalentScore(data.score?.points || null);
      console.log("Talent Protocol score:", data);
    } catch (error) {
      console.error("Error fetching Talent Protocol score:", error);
      setTalentScoreError((error as Error).message);
    } finally {
      setTalentScoreLoading(false);
    }
  };

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
              github: githubUsername || null,
              twitter: twitterUsername || null,
              farcaster: farcasterUsername || null,
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
          github: githubUsername || null,
          twitter: twitterUsername || null,
          farcaster: farcasterUsername || null,
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

      {talentScore !== null && (
        <div className="bg-gray-900 p-4 rounded-lg border border-purple-400 text-white">
          <div className="flex items-start gap-3">
            <Image
              src="/talent-protocol-logo.jpg"
              alt="Talent Protocol"
              width={64}
              height={64}
              className="rounded-full mt-1"
            />
            <div>
              <h2 className="text-lg font-semibold text-white m-0">Builder Score</h2>
              <div className="text-3xl font-bold text-purple-400">{talentScore}</div>
            </div>
          </div>
        </div>
      )}

      {talentScoreLoading && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-white">
          <div className="flex items-center gap-3">
            <Image
              src="/talent-protocol-logo.jpg"
              alt="Talent Protocol"
              width={32}
              height={32}
              className="rounded-full opacity-70"
            />
            <div>
              <h2 className="text-lg font-semibold text-white m-0">Builder Score</h2>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                <p className="text-gray-300 m-0">Loading Builder score...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {talentScoreError && (
        <div className="bg-gray-900 p-4 rounded-lg border border-red-500">
          <div className="flex items-start gap-3">
            <Image
              src="/talent-protocol-logo.jpg"
              alt="Talent Protocol"
              width={32}
              height={32}
              className="rounded-full opacity-70"
            />
            <div>
              <h2 className="text-lg font-semibold text-white m-0">Builder Score</h2>
              <p className="text-red-400 text-sm m-0">{talentScoreError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social Media</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Farcaster Username</label>
            <InputBase
              placeholder="Enter your Farcaster username"
              value={farcasterUsername}
              onChange={setFarcasterUsername}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter Username</label>
            <InputBase
              placeholder="Enter your Twitter username"
              value={twitterUsername}
              onChange={setTwitterUsername}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GitHub Username</label>
            <InputBase placeholder="Enter your GitHub username" value={githubUsername} onChange={setGithubUsername} />
          </div>
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
