import React from "react"
import { Button } from "@/components/ui/button"
import { Maximize, RotateCcw, Expand, Minimize } from 'lucide-react'

interface ChartControlsProps {
  onFitToScreen: () => void
  onResetView: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function ChartControls({
  onFitToScreen,
  onResetView,
  onExpandAll,
  onCollapseAll,
}: ChartControlsProps) {
  return (
    // Main controls in top right
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Expand/Collapse Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Expand All"
        >
          <Expand className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Collapse All"
        >
          <Minimize className="h-4 w-4" />
        </Button>
      </div>

      {/* View Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFitToScreen}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Fit to Screen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetView}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-slate-200"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
