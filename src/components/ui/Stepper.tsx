interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-0 w-full max-w-2xl mx-auto">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-200
                  ${isCompleted
                    ? 'bg-[#16A34A] text-white'
                    : isCurrent
                    ? 'bg-[#0F3D2E] text-white ring-4 ring-[#DCFCE7]'
                    : 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap hidden sm:block ${
                  isCurrent ? 'text-[#0F3D2E]' : isCompleted ? 'text-[#16A34A]' : 'text-[#9CA3AF]'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 mt-[-20px] transition-all duration-300
                  ${i < currentStep ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
