export function boot(opts?: {
  root?: HTMLElement | null
  lang?: "en" | "ur"
  onComplete?: (result: {
    score: number
    completed: boolean
    metadata?: Record<string, unknown>
  }) => void
}): void

export function destroy(): void
