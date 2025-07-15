'use client'

import React from 'react'

interface ProgressStep {
  number: number
  label: string
  completed: boolean
  current: boolean
}

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  const progressSteps: ProgressStep[] = steps.map((step, index) => ({
    number: index + 1,
    label: step,
    completed: index < currentStep,
    current: index === currentStep
  }))

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {progressSteps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
              step.completed 
                ? 'bg-green-500 text-white' 
                : step.current 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? '✓' : step.number}
            </div>
            <span className={`text-sm font-medium transition-colors duration-200 ${
              step.completed 
                ? 'text-gray-600' 
                : step.current 
                ? 'text-gray-600' 
                : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < progressSteps.length - 1 && (
            <div className={`w-8 h-1 rounded transition-colors duration-200 ${
              step.completed ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 