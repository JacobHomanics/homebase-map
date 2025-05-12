import { FaGithub, FaTwitter } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";

interface SocialButtonsProps {
  github?: string | null;
  twitter?: string | null;
  farcaster?: string | null;
  className?: string;
}

export default function SocialButtons({ github, twitter, farcaster, className = "" }: SocialButtonsProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      {github && (
        <a
          href={`https://github.com/${github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="GitHub Profile"
        >
          <FaGithub className="w-6 h-6" />
        </a>
      )}
      {twitter && (
        <a
          href={`https://twitter.com/${twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Twitter Profile"
        >
          <FaTwitter className="w-6 h-6" />
        </a>
      )}
      {farcaster && (
        <a
          href={`https://warpcast.com/${farcaster}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Farcaster Profile"
        >
          <SiFarcaster className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}
