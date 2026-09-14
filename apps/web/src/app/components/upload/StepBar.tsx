import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface StepBarProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (step: number) => void;
}

export function StepBar({ currentStep, steps, onStepClick }: StepBarProps) {
  return (
    <div className="px-4 py-4 border-b border-border bg-card sticky top-0 z-30">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Step circle */}
              <motion.button
                onClick={() => onStepClick?.(idx)}
                className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center transition-colors ${
                  idx === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : idx < currentStep
                    ? 'bg-success text-white'
                    : 'bg-muted text-foreground-secondary'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {idx < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </motion.button>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <motion.div
                  className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                    idx < currentStep ? 'bg-success' : 'bg-muted'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Step labels */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
          {steps.map((step, idx) => (
            <p
              key={idx}
              className={`text-xs font-medium transition-colors ${
                idx === currentStep
                  ? 'text-foreground'
                  : idx < currentStep
                  ? 'text-success'
                  : 'text-foreground-secondary'
              }`}
            >
              {step}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
