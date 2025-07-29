'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StepNavigationProps {
  onBack: () => void
  onNext: () => void
  canGoBack: boolean
  canGoNext: boolean
  isLastStep?: boolean
  isPending?: boolean
  nextLabel?: string
  backLabel?: string
}

export function StepNavigation({ 
  onBack, 
  onNext, 
  canGoBack, 
  canGoNext, 
  isLastStep = false,
  isPending = false,
  nextLabel = "Continuar",
  backLabel = "Atrás"
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-gray-200">
      <Button 
        onClick={onBack} 
        variant="outline" 
        type="button"
        disabled={!canGoBack || isPending}
        className="px-6 py-2 text-base font-medium border-2 hover:bg-gray-50 disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {backLabel}
      </Button>
      
      <Button 
        onClick={onNext} 
        type="button"
        disabled={!canGoNext || isPending}
        className={`px-6 py-2 text-base font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
          isLastStep 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      >
        {nextLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
} 