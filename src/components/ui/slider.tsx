import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className={cn(
          "w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700",
          "slider:bg-blue-600 slider:h-2 slider:rounded-lg slider:cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }