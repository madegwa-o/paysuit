
import type { OrgNode } from "@/types/org-chart"

export interface Connection {
  path: string
  from: OrgNode
  to: OrgNode
}

export function getConnectionPaths(hierarchy: OrgNode, expandedNodes: Set<string>): Connection[] {
  const connections: Connection[] = []

  function collectConnections(node: OrgNode, parentExpanded: boolean = true) {
    if (!parentExpanded) return

    const isExpanded = expandedNodes.has(node.id)
    
    // Only show connections to children if this node is expanded
    if (isExpanded) {
      node.children.forEach(child => {
        connections.push({
          path: createConnectionPath(node, child),
          from: node,
          to: child,
        })
        
        // Recursively collect connections from children
        collectConnections(child, true)
      })
    }
  }

  collectConnections(hierarchy)
  return connections
}

function createConnectionPath(parent: OrgNode, child: OrgNode): string {
  const startX = parent.x
  const startY = parent.y + 40 // Bottom of parent card
  const endX = child.x
  const endY = child.y - 40 // Top of child card

  // Create a simple curved path
  const midY = startY + (endY - startY) / 2

  return `M ${startX} ${startY} 
          C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
}
