import type { Employee } from "@/data/employees"
import type { OrgNode } from "@/types/org-chart"

export function buildHierarchy(employees: Employee[]): OrgNode {
  const employeeMap = new Map<string, Employee>()
  employees.forEach((emp) => employeeMap.set(emp.name, emp))

  // Find root (employee with no manager or manager not in list)
  const root = employees.find((emp) => !emp.manager || !employeeMap.has(emp.manager))
  if (!root) throw new Error("No root employee found")

  function buildNode(employee: Employee, level = 0): OrgNode {
    const children = employees
      .filter((emp) => emp.manager === employee.name)
      .map((child) => buildNode(child, level + 1))

    return {
      id: employee.name,
      name: employee.name,
      role: employee.role,
      jobFamily: employee.jobFamily,
      children,
      x: 0,
      y: 0,
      level,
    }
  }

  return buildNode(root)
}

export function layoutNodesWithDagre(root: OrgNode, expandedNodes?: Set<string>): void {
  const nodeWidth = 280
  const nodeHeight = 120
  const levelHeight = 200
  const siblingSpacing = 40

  // First pass: calculate subtree widths (only for expanded/visible children)
  function calculateSubtreeWidth(node: OrgNode): number {
    // Get only the visible children (those that are expanded)
    const visibleChildren = expandedNodes 
      ? node.children.filter(child => expandedNodes.has(node.id)) // Only if parent is expanded
      : node.children

    if (visibleChildren.length === 0) {
      return nodeWidth
    }

    const childrenWidth = visibleChildren.reduce((total, child, index) => {
      const childWidth = calculateSubtreeWidth(child)
      return total + childWidth + (index > 0 ? siblingSpacing : 0)
    }, 0)

    return Math.max(nodeWidth, childrenWidth)
  }

  // Second pass: position nodes (only position visible children)
  function positionNodes(node: OrgNode, x: number, y: number, availableWidth: number): void {
    const subtreeWidth = calculateSubtreeWidth(node)

    // Center the node in its available space
    node.x = x + (availableWidth - nodeWidth) / 2
    node.y = y

    // Get only the visible children
    const visibleChildren = expandedNodes 
      ? node.children.filter(child => expandedNodes.has(node.id))
      : node.children

    if (visibleChildren.length === 0) return

    // Calculate total width needed for visible children
    const totalChildrenWidth = visibleChildren.reduce((total, child, index) => {
      const childWidth = calculateSubtreeWidth(child)
      return total + childWidth + (index > 0 ? siblingSpacing : 0)
    }, 0)

    // Position visible children
    let currentX = x + (availableWidth - totalChildrenWidth) / 2
    const childY = y + levelHeight

    visibleChildren.forEach((child, index) => {
      if (index > 0) currentX += siblingSpacing
      const childWidth = calculateSubtreeWidth(child)
      positionNodes(child, currentX, childY, childWidth)
      currentX += childWidth
    })
  }

  const totalWidth = calculateSubtreeWidth(root)
  positionNodes(root, 0, 0, totalWidth)
}
