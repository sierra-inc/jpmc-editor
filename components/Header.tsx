'use client'

import { AlertTriangle } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-slate-900 text-white">
      {/* Demo disclaimer banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Demo Only:</strong> This is a demonstration application.
            Not for production use or processing of real customer data.
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/jpmc-logo.svg"
                alt="JP Morgan Chase"
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-lg font-semibold">Agent Editor</h1>
                <p className="text-xs text-jpmc-gray-300">JP Morgan Chase</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/api/agent"
              target="_blank"
              className="text-sm bg-jpmc-blue px-3 py-1.5 rounded hover:bg-opacity-90 transition-colors"
            >
              View YAML
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
