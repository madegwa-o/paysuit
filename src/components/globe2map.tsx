
"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { feature } from "topojson-client"
import { Button } from "@/components/ui/button"
import type { Topology, Objects } from "topojson-specification"
import type { GeoPermissibleObjects, GeoProjection } from "d3-geo"
import { GeoRawProjection } from "d3"

interface GeoFeature {
    type: string
    geometry: GeoJSON.Geometry
    properties: Record<string, unknown>
}

interface TopologyResponse {
    type: string
    objects: Objects
    arcs: number[][][]
    bbox?: number[]
    transform?: {
        scale: number[]
        translate: number[]
    }
}

interface InterpolatedProjection extends GeoProjection {
    alpha(value: number): InterpolatedProjection
    alpha(): number
}
function interpolateProjection(
    raw0: () => GeoRawProjection,
    raw1: () => GeoRawProjection
): InterpolatedProjection {
    const mutate = d3.geoProjectionMutator(
        (t: number) => (x: number, y: number): [number, number] => {
            // @ts-expect-error raw projection signature mismatch
            const [x0, y0] = raw0(x, y)
            // @ts-expect-error raw projection signature mismatch
            const [x1, y1] = raw1(x, y)

            return [x0 + t * (x1 - x0), y0 + t * (y1 - y0)]
        }
    )

    let t = 0

    // @ts-expect-error d3 mutator returns untyped projection
    const projection = mutate(t) as InterpolatedProjection

    // @ts-expect-error extending projection with alpha method
    projection.alpha = function (
        value?: number
    ): InterpolatedProjection | number {
        if (arguments.length === 0) return t

        t = value as number
        // @ts-expect-error mutate return type is incompatible
        return mutate(t) as InterpolatedProjection
    }

    return projection
}


export function GlobeToMapTransform() {
    const svgRef = useRef<SVGSVGElement>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [worldData, setWorldData] = useState<GeoFeature[]>([])
    const [rotation, setRotation] = useState([0, 0])
    const [translation] = useState([0, 0])
    const [isDragging, setIsDragging] = useState(false)
    const [lastMouse, setLastMouse] = useState([0, 0])
    const [autoRotate, setAutoRotate] = useState(true)

    // Use refs for animation to avoid re-renders
    const animationFrameRef = useRef<number>(0)
    const rotationRef = useRef([0, 0])
    const isMountedRef = useRef(true)

    const width = 800
    const height = 500

    // Sync rotation ref with state
    useEffect(() => {
        rotationRef.current = rotation
    }, [rotation])

    // Component mount tracking
    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    // Load world data once
    useEffect(() => {
        const loadWorldData = async () => {
            try {
                const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
                const world = (await response.json()) as TopologyResponse
                const featureResult = feature(world as Topology, world.objects.countries)

                const countries =
                    "features" in featureResult ? (featureResult.features as GeoFeature[]) : ([featureResult] as GeoFeature[])

                if (isMountedRef.current) {
                    setWorldData(countries)
                }
            } catch (error) {
                console.error("Error loading world data:", error)
                const fallbackData: GeoFeature[] = [
                    {
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [
                                [
                                    [-180, -90],
                                    [180, -90],
                                    [180, 90],
                                    [-180, 90],
                                    [-180, -90],
                                ],
                            ],
                        },
                        properties: {},
                    },
                ]
                if (isMountedRef.current) {
                    setWorldData(fallbackData)
                }
            }
        }

        loadWorldData()
    }, [])

    // Auto-rotate with throttled updates
    useEffect(() => {
        if (!autoRotate || isDragging || progress !== 0 || worldData.length === 0) return

        let lastUpdate = Date.now()
        const updateInterval = 50 // Update every 50ms instead of every frame

        const animate = () => {
            if (!isMountedRef.current) return

            const now = Date.now()
            if (now - lastUpdate >= updateInterval) {
                rotationRef.current = [rotationRef.current[0] + 0.5, rotationRef.current[1]]
                setRotation([...rotationRef.current])
                lastUpdate = now
            }

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animationFrameRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [autoRotate, isDragging, progress, worldData.length])

    const handleMouseDown = (event: React.MouseEvent) => {
        setIsDragging(true)
        const rect = svgRef.current?.getBoundingClientRect()
        if (rect) {
            setLastMouse([event.clientX - rect.left, event.clientY - rect.top])
        }
    }

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!isDragging) return

        const rect = svgRef.current?.getBoundingClientRect()
        if (!rect) return

        const currentMouse = [event.clientX - rect.left, event.clientY - rect.top]
        const dx = currentMouse[0] - lastMouse[0]
        const dy = currentMouse[1] - lastMouse[1]

        const t = progress / 100

        if (t < 0.5) {
            const sensitivity = 0.5
            setRotation((prev) => [prev[0] + dx * sensitivity, Math.max(-90, Math.min(90, prev[1] - dy * sensitivity))])
        } else {
            const sensitivityMap = 0.25
            setRotation((prev) => [prev[0] + dx * sensitivityMap, Math.max(-90, Math.min(90, prev[1] - dy * sensitivityMap))])
        }

        setLastMouse(currentMouse)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Render visualization (only when data or state changes)
    useEffect(() => {
        if (!svgRef.current || worldData.length === 0) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const t = progress / 100
        const alpha = Math.pow(t, 0.5)

        const scale = d3.scaleLinear().domain([0, 1]).range([200, 120])
        const baseRotate = d3.scaleLinear().domain([0, 1]).range([0, 0])

        const projection = interpolateProjection(d3.geoOrthographicRaw, d3.geoEquirectangularRaw)
            .scale(scale(alpha))
            .translate([width / 2 + translation[0], height / 2 + translation[1]])
            .rotate([baseRotate(alpha) + rotation[0], rotation[1]])
            .precision(0.1)

        projection.alpha(alpha)

        const path = d3.geoPath(projection)

        try {
            const graticule = d3.geoGraticule()
            const graticulePath = path(graticule())
            if (graticulePath) {
                svg
                    .append("path")
                    .datum(graticule())
                    .attr("d", graticulePath)
                    .attr("fill", "none")
                    .attr("stroke", "#cccccc")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.2)
            }
        } catch (error) {
            console.error("Error creating graticule:", error)
        }

        svg
            .selectAll(".country")
            .data(worldData)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", (d) => {
                try {
                    const pathString = path(d as GeoPermissibleObjects)
                    if (!pathString) return ""
                    if (typeof pathString === "string" && (pathString.includes("NaN") || pathString.includes("Infinity"))) {
                        return ""
                    }
                    return pathString
                } catch (error) {
                    return ""
                }
            })
            .attr("fill", "none")
            .attr("stroke", "#cccccc")
            .attr("stroke-width", 1.0)
            .attr("opacity", 1.0)
            .style("visibility", function () {
                const pathData = d3.select(this).attr("d")
                return pathData && pathData.length > 0 && !pathData.includes("NaN") ? "visible" : "hidden"
            })

        try {
            const sphereOutline = path({ type: "Sphere" })
            if (sphereOutline) {
                svg
                    .append("path")
                    .datum({ type: "Sphere" })
                    .attr("d", sphereOutline)
                    .attr("fill", "none")
                    .attr("stroke", "#FFF")
                    .attr("stroke-width", 1)
                    .attr("opacity", 1.0)
            }
        } catch (error) {
            console.error("Error creating sphere outline:", error)
        }
    }, [worldData, progress, rotation, translation, width, height])

    const handleAnimate = () => {
        if (isAnimating) return

        setIsAnimating(true)
        const startProgress = progress
        const endProgress = startProgress === 0 ? 100 : 0
        const duration = 2000

        const startTime = Date.now()

        const animate = () => {
            if (!isMountedRef.current) {
                setIsAnimating(false)
                return
            }

            const elapsed = Date.now() - startTime
            const t = Math.min(elapsed / duration, 1)

            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            const currentProgress = startProgress + (endProgress - startProgress) * eased

            setProgress(currentProgress)

            if (t < 1) {
                requestAnimationFrame(animate)
            } else {
                setIsAnimating(false)
            }
        }

        animate()
    }

    const handleReset = () => {
        setRotation([0, 0])
    }

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full bg-transparent cursor-grab active:cursor-grabbing"
                preserveAspectRatio="xMidYMid meet"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <Button
                    onClick={() => setAutoRotate(!autoRotate)}
                    variant="outline"
                    className="cursor-pointer min-w-[120px] border-white/20 hover:bg-white/10 bg-transparent rounded"
                >
                    {autoRotate ? "Pause" : "Auto Rotate"}
                </Button>
                <Button onClick={handleAnimate} disabled={isAnimating} className="cursor-pointer min-w-[120px] rounded">
                    {isAnimating ? "Animating..." : progress === 0 ? "Unroll Globe" : "Roll to Globe"}
                </Button>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="cursor-pointer min-w-[80px] border-white/20 hover:bg-white/10 bg-transparent rounded"
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}