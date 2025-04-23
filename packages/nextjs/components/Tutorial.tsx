"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  MapPinIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Step 1: Connect Wallet",
    description:
      "Click the 'Connect Wallet' button in the top-right corner to get started. This will allow you to interact with the blockchain network.",
    icon: <WalletIcon className="h-12 w-12 text-primary" />,
  },
  {
    title: "Step 2: Share Location",
    description: "Allow location permissions when prompted. This helps you discover events and people nearby.",
    icon: <MapPinIcon className="h-12 w-12 text-primary" />,
  },
  {
    title: "Step 3: Check In",
    description: "Find a local event on the map and check in. Your presence will be recorded on the blockchain!",
    icon: <CheckCircleIcon className="h-12 w-12 text-primary" />,
  },
  {
    title: "Step 4: Share Your Check-in",
    description:
      "After checking in, share your achievement with your friends on Twitter. Let others know where you've been!",
    icon: <ShareIcon className="h-12 w-12 text-primary" />,
  },
];

export const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsOpen(false);
      setCurrentStep(0);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-circle btn-sm bg-primary text-primary-content hover:bg-primary-focus"
        title="How to use Home Base"
        aria-label="Open Tutorial"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="modal-box relative w-full max-w-lg">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => {
                setIsOpen(false);
                setCurrentStep(0);
              }}
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Home Base Tutorial</h2>
              <p className="text-sm opacity-70">Learn how to use the app in a few simple steps</p>
            </div>

            <div className="flex items-center mb-4">
              <div className="mr-6 flex items-center justify-center">{tutorialSteps[currentStep].icon}</div>
              <div>
                <h3 className="font-bold text-lg">{tutorialSteps[currentStep].title}</h3>
                <p className="text-sm opacity-90">{tutorialSteps[currentStep].description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <button className="btn btn-outline btn-sm" onClick={handlePrev} disabled={currentStep === 0}>
                Previous
              </button>

              <div className="flex gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentStep === index ? "bg-primary" : "bg-gray-300"}`}
                  />
                ))}
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleNext}>
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
