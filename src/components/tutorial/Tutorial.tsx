'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { tutorialSteps, TutorialStep } from '@/lib/tutorial-steps';

interface TutorialProps {
  initialStep?: number;
  onComplete?: () => void;
}

export function Tutorial({ initialStep = 1, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const step = tutorialSteps.find(s => s.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === tutorialSteps.length;

  // Find and highlight target element
  useEffect(() => {
    if (step?.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
    }
  }, [step]);

  // Save progress to API
  async function saveProgress(stepNumber: number, completed = false) {
    try {
      await fetch('/api/tutorial', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNumber,
          completed,
        }),
      });
    } catch (error) {
      console.error('Failed to save tutorial progress:', error);
    }
  }

  async function handleNext() {
    if (isLastStep) {
      await saveProgress(0, true);
      setIsVisible(false);
      onComplete?.();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveProgress(nextStep);
    }
  }

  function handlePrevious() {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress(prevStep);
    }
  }

  async function handleSkip() {
    try {
      await fetch('/api/tutorial', {
        method: 'POST',
      });
      setIsVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Failed to skip tutorial:', error);
    }
  }

  if (!isVisible || !step) return null;

  const Icon = step.icon;
  const isCentered = step.position === 'center' || !step.target;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 z-[100] backdrop-blur-[1px]">
        {/* Highlight target element if exists */}
        {targetElement && (
          <div
            className="absolute border-4 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-500/50 pointer-events-none animate-pulse"
            style={{
              top: `${targetElement.offsetTop - 8}px`,
              left: `${targetElement.offsetLeft - 8}px`,
              width: `${targetElement.offsetWidth + 16}px`,
              height: `${targetElement.offsetHeight + 16}px`,
            }}
          />
        )}
      </div>

      {/* Tutorial card */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <Card className={`relative bg-gray-900/95 backdrop-blur-xl border-cyan-500/50 shadow-2xl shadow-cyan-500/20 max-w-lg w-full pointer-events-auto ${
          isCentered ? '' : 'animate-in slide-in-from-bottom-4'
        }`}>
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-lg opacity-20 blur-xl"></div>

          <div className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-orbitron">
                      {step.title}
                    </CardTitle>
                    <p className="text-gray-400 text-xs mt-1">
                      Step {currentStep} of {tutorialSteps.length}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {tutorialSteps.map(s => (
                  <div
                    key={s.id}
                    className={`h-2 rounded-full transition-all ${
                      s.id === currentStep
                        ? 'w-8 bg-cyan-400'
                        : s.id < currentStep
                        ? 'w-2 bg-cyan-600'
                        : 'w-2 bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                {!isFirstStep && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-orbitron"
                >
                  {step.nextButtonText || 'Next'}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
                  {isLastStep && <Sparkles className="w-4 h-4 ml-2" />}
                </Button>
              </div>

              {/* Skip button */}
              <div className="text-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </>
  );
}

