import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const { targetNetwork } = useTargetNetwork();
  const isCoinbaseWallet = typeof window !== "undefined" && window?.ethereum?.isCoinbaseWallet;

  return (
    <div className="dropdown dropdown-end mr-2">
      <label tabIndex={0} className="btn btn-error btn-sm dropdown-toggle gap-1">
        <span>Wrong network</span>
        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 mt-1 shadow-center shadow-accent bg-base-200 rounded-box gap-1"
      >
        {isCoinbaseWallet && (
          <li className="p-3 bg-warning text-warning-content rounded-lg mb-2">
            <div className="flex gap-2 items-center">
              <InformationCircleIcon className="h-6 w-6" />
              <div>
                <p className="font-bold">Coinbase Wallet Users</p>
                <p className="text-xs">
                  Please manually switch to {targetNetwork.name} network in your wallet settings.
                </p>
              </div>
            </div>
          </li>
        )}
        <NetworkOptions />
        <li>
          <button
            className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
