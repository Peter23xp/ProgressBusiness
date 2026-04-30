import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  status: 'done' | 'active' | 'pending';
}

interface StepperProps {
  steps: Step[];
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="stepper">
      {steps.map((step, index) => (
        <div key={index} className="stepper-step">
          {/* Connector line (not before the first step) */}
          {index > 0 && (
            <div
              className={cn(
                'stepper-line',
                step.status === 'done' ? 'bg-primary-accent' : 'bg-gray-200',
              )}
            />
          )}

          {/* Dot */}
          <div
            className={cn(
              'stepper-dot',
              step.status === 'active' && 'active',
              step.status === 'done' && 'done',
              step.status === 'pending' && 'pending',
            )}
          >
            {step.status === 'done' ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <span className="text-xs font-bold">{index + 1}</span>
            )}
          </div>

          {/* Label */}
          <span
            className={cn(
              'mt-2 text-xs font-medium text-center leading-tight',
              step.status === 'done' && 'text-primary-accent',
              step.status === 'active' && 'text-primary-DEFAULT font-semibold',
              step.status === 'pending' && 'text-gray-400',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
