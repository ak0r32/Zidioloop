"use client";

import { useState, useEffect } from "react";
import { Button } from "./form";

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
  keyPoints: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    icon: "🎯",
    title: "Welcome to LOOP",
    description:
      "Close the loop on customer feedback with AI-powered insights",
    keyPoints: [
      "Collect feedback from multiple channels",
      "Analyze sentiment and themes automatically",
      "Take action on customer insights",
    ],
  },
  {
    icon: "💬",
    title: "Collect Feedback",
    description: "Gather customer feedback from email, chat, surveys, and more",
    keyPoints: [
      "Add feedback manually or import from files",
      "Tag feedback with channels and customer labels",
      "Track feedback status (New, Reviewed, Actioned)",
    ],
  },
  {
    icon: "🏷️",
    title: "Identify Themes",
    description: "Automatically categorize feedback into actionable themes",
    keyPoints: [
      "AI-powered theme detection",
      "Track mentions and sentiment per theme",
      "See patterns across your customer base",
    ],
  },
  {
    icon: "📈",
    title: "Track Trends",
    description: "Monitor how customer sentiment evolves over time",
    keyPoints: [
      "Visualize feedback volume trends",
      "Track sentiment changes",
      "Identify emerging issues early",
    ],
  },
  {
    icon: "🤖",
    title: "Ask LOOP",
    description: "Get AI-powered insights by asking natural language questions",
    keyPoints: [
      "Ask questions about your feedback",
      "Get instant, data-driven answers",
      "Export analysis reports",
    ],
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl border border-violet-500/50 bg-gradient-to-br from-slate-900/98 to-slate-950/98 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
              }}
            />
          </div>

          {/* Content */}
          <div className="px-8 py-12 flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="text-6xl animate-bounce">{step.icon}</div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                {step.title}
              </h2>
              <p className="text-slate-400 text-lg">{step.description}</p>
            </div>

            {/* Key Points */}
            <div className="space-y-3 text-left w-full">
              {step.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 transition-colors"
                >
                  <span className="text-violet-400 font-bold text-lg flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-slate-300">{point}</span>
                </div>
              ))}
            </div>

            {/* Step Indicator */}
            <div className="flex gap-2 justify-center">
              {onboardingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx <= currentStep
                      ? "bg-violet-500 w-6"
                      : "bg-slate-600 w-2"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full pt-4">
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  ← Back
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleNext}
                className={currentStep > 0 ? "flex-1" : "w-full"}
              >
                {currentStep === onboardingSteps.length - 1
                  ? "Get Started!"
                  : "Next →"}
              </Button>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleComplete}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors font-medium"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboardingState() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding-completed");
    setShowOnboarding(!completed);
    setIsLoaded(true);
  }, []);

  return { showOnboarding, setShowOnboarding, isLoaded };
}
