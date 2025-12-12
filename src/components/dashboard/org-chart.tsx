"use client"

import React, { useEffect, useState, useRef } from "react"
import type { OrgNode } from "@/types/org-chart"
import { employees } from "@/data/employees"
import { buildHierarchy, layoutNodesWithDagre } from "@/utils/hierarchy"
import { useChartNavigation } from "@/hooks/use-chart-navigation"
import { EmployeeCard } from "@/components/employee-card"
import { ConnectionLines } from "@/components/dashboard/connection-lines"
import { ChartControls } from "@/components/dashboard/chart-controls"
import { ZoomControls } from "@/components/dashboard/zoom-controls"
import { ChartLegend } from "@/components/dashboard/chart-legend"

export function OrgChart() {
  const [hierarchy, setHierarchy] = useState<OrgNode | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const hasAutoFitted = useRef(false)

  const {
    scale,
    position,
    isDragging,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    setPosition,
  } = useChartNavigation()

  useEffect(() => {
    const root = buildHierarchy(employees)
    const initialExpanded = new Set([root.id])
    layoutNodesWithDagre(root, initialExpanded) // Pass expanded nodes to layout
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHierarchy(root)

    // Start with only the CEO expanded (root node)
    setExpandedNodes(initialExpanded)

    // Center the chart initially
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: containerRect.width / 2 - 200,
        y: 50,
      })
    }
  }, [setPosition])

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        // When collapsing, also collapse all descendants
        const collapseDescendants = (node: OrgNode) => {
          newSet.delete(node.id)
          node.children.forEach(child => collapseDescendants(child))
        }
        
        if (hierarchy) {
          const findNode = (node: OrgNode): OrgNode | null => {
            if (node.id === nodeId) return node
            for (const child of node.children) {
              const found = findNode(child)
              if (found) return found
            }
            return null
          }
          
          const nodeToCollapse = findNode(hierarchy)
          if (nodeToCollapse) {
            collapseDescendants(nodeToCollapse)
          }
        }
      } else {
        // When expanding, only expand this node (one level deep)
        newSet.add(nodeId)
      }
      
      // Recalculate layout after expansion/collapse changes
      if (hierarchy) {
        layoutNodesWithDagre(hierarchy, newSet) // Pass the updated expanded nodes
        setHierarchy({ ...hierarchy }) // Trigger re-render with new positions
        
        // Auto fit to screen after layout recalculation
        setTimeout(() => {
          fitToScreen(hierarchy, newSet)
        }, 50)
      }
      
      return newSet
    })
  }

  const expandAll = () => {
    const getAllNodeIds = (node: OrgNode): string[] => {
      const ids = [node.id]
      node.children.forEach(child => {
        ids.push(...getAllNodeIds(child))
      })
      return ids
    }
    
    if (hierarchy) {
      const allExpanded = new Set(getAllNodeIds(hierarchy))
      layoutNodesWithDagre(hierarchy, allExpanded) // Recalculate layout for all expanded
      setHierarchy({ ...hierarchy })
      setExpandedNodes(allExpanded)
      
      // Auto fit to screen after expand all
      setTimeout(() => {
        fitToScreen(hierarchy, allExpanded)
      }, 50)
    }
  }

  const collapseAll = () => {
    // Keep only the root node expanded
    if (hierarchy) {
      const rootOnly = new Set([hierarchy.id])
      layoutNodesWithDagre(hierarchy, rootOnly) // Recalculate layout for collapsed state
      setHierarchy({ ...hierarchy })
      setExpandedNodes(rootOnly)
      
      // Auto fit to screen after collapse all
      setTimeout(() => {
        fitToScreen(hierarchy, rootOnly)
      }, 50)
    }
  }

  const handleFitToScreen = () => {
    if (hierarchy) {
      fitToScreen(hierarchy, expandedNodes)
    }
  }

  const renderVisibleNodes = (node: OrgNode, parentExpanded: boolean = true): React.ReactNode[] => {
    // Only render this node if its parent is expanded
    if (!parentExpanded) {
      return []
    }

    const isExpanded = expandedNodes.has(node.id)
    const nodes = [
      <EmployeeCard
        key={node.id}
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNodeExpansion(node.id)}
      />
    ]

    // Only render children if this node is expanded
    if (isExpanded) {
      node.children.forEach((child) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return nodes.push(...renderVisibleNodes(child, true))
      })
    }

    return nodes
  }

  // Auto-fit on initial load when hierarchy is ready
  useEffect(() => {
    if (hierarchy && !hasAutoFitted.current) {
      fitToScreen(hierarchy, expandedNodes)
      hasAutoFitted.current = true
    }
  }, [hierarchy, fitToScreen, expandedNodes])

  if (!hierarchy) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">
          <div className="text-lg text-slate-600 dark:text-slate-400">Loading organization chart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200">
      {/* Background pattern */}
      <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(100 116 139 / 0.4) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
      />

      {/* Main controls in top right */}
      <ChartControls
        onFitToScreen={handleFitToScreen}
        onResetView={resetView}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      {/* Zoom controls in bottom right */}
      <ZoomControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      <ChartLegend />

      {/* Full screen background for dragging */}
      <div
        className={`fixed inset-0 z-0 ${
          isDragging 
            ? "cursor-grabbing" 
            : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel} // Added wheel event handler here
      />

      {/* Chart Container */}
      <div
        ref={containerRef}
        className="w-full h-full select-none"
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="relative transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <ConnectionLines hierarchy={hierarchy} expandedNodes={expandedNodes} />
          {renderVisibleNodes(hierarchy)}
        </div>
      </div>
    </div>
  )
}
