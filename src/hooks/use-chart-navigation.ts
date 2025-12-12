import { useState, useCallback, useRef } from "react"

interface Position {
  x: number
  y: number
}

export function useChartNavigation() {
  const [scale, setScale] = useState(0.8)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Allow dragging from anywhere, not just the background
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      e.preventDefault()
    },
    [position],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomIntensity = 0.1
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity
      const newScale = Math.max(0.1, Math.min(3, scale * (1 + delta)))

      const scaleChange = newScale / scale
      const newPosition = {
        x: mouseX - (mouseX - position.x) * scaleChange,
        y: mouseY - (mouseY - position.y) * scaleChange,
      }

      setScale(newScale)
      setPosition(newPosition)
    },
    [scale, position],
  )

  const zoomIn = useCallback(() => {
    const newScale = Math.min(3, scale * 1.2)
    setScale(newScale)
  }, [scale])

  const zoomOut = useCallback(() => {
    const newScale = Math.max(0.1, scale / 1.2)
    setScale(newScale)
  }, [scale])

  const resetView = useCallback(() => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: containerRect.width / 2 - 200,
        y: 50,
      })
      setScale(0.8)
    }
  }, [])

  const fitToScreen = useCallback((hierarchy: any, expandedNodes: Set<string>) => {
    if (!hierarchy || !containerRef.current) return

    const bounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }

    // Only calculate bounds for visible nodes (expanded or root)
    function calculateBounds(node: any) {
      // Use the center of the node for more accurate centering
      const nodeLeft = node.x
      const nodeRight = node.x + 280 // card width
      const nodeTop = node.y
      const nodeBottom = node.y + 120 // card height
      
      bounds.minX = Math.min(bounds.minX, nodeLeft)
      bounds.maxX = Math.max(bounds.maxX, nodeRight)
      bounds.minY = Math.min(bounds.minY, nodeTop)
      bounds.maxY = Math.max(bounds.maxY, nodeBottom)
      
      // Only traverse children if this node is expanded
      if (expandedNodes.has(node.id)) {
        node.children.forEach(calculateBounds)
      }
    }

    calculateBounds(hierarchy)

    const containerRect = containerRef.current.getBoundingClientRect()
    const contentWidth = bounds.maxX - bounds.minX
    const contentHeight = bounds.maxY - bounds.minY

    // Add padding around the content
    const padding = 50
    const scaleX = (containerRect.width - padding * 2) / contentWidth
    const scaleY = (containerRect.height - padding * 2) / contentHeight
    const newScale = Math.min(scaleX, scaleY, 1)

    // Calculate the center of the content
    const contentCenterX = (bounds.minX + bounds.maxX) / 2
    const contentCenterY = (bounds.minY + bounds.maxY) / 2
    
    // Calculate the center of the container
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2
    
    // Position to center the content in the container
    const newPosition = {
      x: containerCenterX - contentCenterX * newScale,
      y: containerCenterY - contentCenterY * newScale,
    }

    setScale(newScale)
    setPosition(newPosition)
  }, [])

  return {
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
  }
}
