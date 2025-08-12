import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin",
        size === "sm" && "w-4 h-4",
        size === "md" && "w-6 h-6", 
        size === "lg" && "w-8 h-8",
        className
      )} 
    />
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title = "Loading...", description, className }: LoadingCardProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  isLoading: boolean
  className?: string
}

export function LoadingButton({ children, isLoading, className }: LoadingButtonProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  )
}
