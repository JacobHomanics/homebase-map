import { useState } from "react";
import { privateKeyToAddress } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";

export function KeyGenerator() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<any>(undefined);
  const [generatedPublicKey, setGeneratedPublicKey] = useState<any>(undefined);

  return (
    <>
      <div>
        <p className="text-center">{"Don't see your country?"}</p>
        <button
          className="btn btn-lg btn-secondary w-[150px]"
          onClick={async () => {
            const privateKey = generatePrivateKey();
            const account = privateKeyToAddress(privateKey);

            setGeneratedPrivateKey(privateKey);
            setGeneratedPublicKey(account);
            togglePopup();
          }}
        >
          {"Add it!"}
        </button>
      </div>
      {isOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-base-100 p-6 rounded-lg w-full text-center shadow-lg w-[800px] mt-10 mb-10">
            <p className="m-0">Private Key</p>
            <p className="m-0">{generatedPrivateKey}</p>
            <p className="m-0">Public Key</p>
            <p className="m-0">{generatedPublicKey}</p>

            <div className="mt-10">
              <p className="text-xl">Please provide the PUBLIC key to the site admin</p>
              <p className="text-xl">SAVE THE PRIVATE KEY SOMEWHERE SAFE</p>
              <p className="text-xl text-rose-900">DO NOT SHARE THE PRIVATE KEY WITH ANYONE ELSE</p>

              <button className="btn btn-primary w-[150px]" onClick={togglePopup}>
                {"Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
