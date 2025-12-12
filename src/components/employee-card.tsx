"use client"

import type React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { OrgNode } from "@/types/org-chart"
import { getJobFamilyColor } from "@/utils/styling"

interface EmployeeCardProps {
  node: OrgNode
  isExpanded: boolean
  onToggle: () => void
}

export function EmployeeCard({ node, isExpanded, onToggle }: EmployeeCardProps) {
  // Access properties directly from node instead of through employee object
  const jobFamilyColor = getJobFamilyColor(node.jobFamily)

  // Count direct reports
  const reportCount = node.children.length

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle()
  }

  // Get avatar background color based on job family
  const getAvatarBgColor = (jobFamily: string) => {
    const colorMap: Record<string, string> = {
      Leadership: "bg-blue-500",
      Product: "bg-green-500",
      Engineering: "bg-purple-500",
      Design: "bg-pink-500",
      Operations: "bg-orange-500",
    }
    return colorMap[jobFamily] || "bg-gray-500"
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-105 transition-transform duration-200"
      style={{
        left: node.x,
        top: node.y,
      }}
      onClick={handleClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 w-64 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              {/* Updated avatar to use job family color instead of gradient */}
              <AvatarFallback className={`${getAvatarBgColor(node.jobFamily)} text-white font-semibold`}>
                {node.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{node.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-tight">{node.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 space-y-2">
          <Badge variant="secondary" className={`text-xs ${jobFamilyColor.bg} ${jobFamilyColor.text} border-0 m-0`}>
            {node.jobFamily}
          </Badge>

          {reportCount > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {reportCount} report{reportCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
