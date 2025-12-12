import React from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ZoomControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
}: ZoomControlsProps) {
  return (
    // Zoom controls in bottom right
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Display */}
      <div className="text-xs text-slate-600 dark:text-slate-400 text-center bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow-lg border border-slate-200">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}
