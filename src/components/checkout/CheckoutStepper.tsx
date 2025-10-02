import { CheckIcon } from '@heroicons/react/24/outline';

interface Step {
  id: string;
  label: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
}

export function CheckoutStepper({ 
  steps, 
  currentStep, 
  completedSteps, 
  onStepClick 
}: CheckoutStepperProps) {
  return (
    <div className="checkout-stepper" id='checkout-stepper'>
      <div className="stepper-progress-bar">
        <div 
          className="stepper-progress-fill"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
      
      <div className="stepper-steps">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isClickable = isCompleted || index <= currentStep;
          
          return (
            <div
              key={step.id}
              className={`stepper-step ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className="step-circle">
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
