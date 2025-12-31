import { ReactNode } from 'react'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-5xl p-4">{children}</div>
    </div>
  )
}
