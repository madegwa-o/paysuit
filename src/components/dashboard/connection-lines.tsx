import React from "react"
import type { OrgNode } from "@/types/org-chart"
import { getConnectionPaths } from "@/utils/connections"

interface ConnectionLinesProps {
  hierarchy: OrgNode
  expandedNodes: Set<string>
}

export function ConnectionLines({ hierarchy, expandedNodes }: ConnectionLinesProps) {
  const connections = getConnectionPaths(hierarchy, expandedNodes)

  if (connections.length === 0) return null

  // Calculate bounds for the SVG
  const allNodes = getAllVisibleNodes(hierarchy, expandedNodes)
  const bounds = {
    minX: Math.min(...allNodes.map(n => n.x)) - 150,
    maxX: Math.max(...allNodes.map(n => n.x)) + 150,
    minY: Math.min(...allNodes.map(n => n.y)) - 100,
    maxY: Math.max(...allNodes.map(n => n.y)) + 100,
  }

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        left: bounds.minX,
        top: bounds.minY,
        width,
        height,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#64748b"
          />
        </marker>
      </defs>
      
      {connections.map((connection, index) => (
        <path
          key={index}
          d={connection.path}
          stroke="#64748b"
          strokeWidth="2"
          strokeDasharray="8,4"
          fill="none"
          className="opacity-60"
          style={{
            transform: `translate(${-bounds.minX}px, ${-bounds.minY}px)`,
          }}
        />
      ))}
    </svg>
  )
}

function getAllVisibleNodes(node: OrgNode, expandedNodes: Set<string>, parentExpanded: boolean = true): OrgNode[] {
  if (!parentExpanded) return []
  
  const nodes = [node]
  const isExpanded = expandedNodes.has(node.id)
  
  if (isExpanded) {
    node.children.forEach(child => {
      nodes.push(...getAllVisibleNodes(child, expandedNodes, true))
    })
  }
  
  return nodes
}
