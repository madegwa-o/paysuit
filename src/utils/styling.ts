import type { JobFamilyStyle } from "@/types/org-chart"

export const getJobFamilyColor = (jobFamily: string): JobFamilyStyle => {
  // Updated job family color mapping to match new structure
  const styles: Record<string, JobFamilyStyle> = {
    Leadership: {
      bg: "bg-blue-100",
      border: "border-blue-200",
      text: "text-blue-800",
      bgDark: "bg-blue-500",
    },
    Product: {
      bg: "bg-green-100",
      border: "border-green-200",
      text: "text-green-800",
      bgDark: "bg-green-500",
    },
    Engineering: {
      bg: "bg-purple-100",
      border: "border-purple-200",
      text: "text-purple-800",
      bgDark: "bg-purple-500",
    },
    Design: {
      bg: "bg-pink-100",
      border: "border-pink-200",
      text: "text-pink-800",
      bgDark: "bg-pink-500",
    },
    Operations: {
      bg: "bg-orange-100",
      border: "border-orange-200",
      text: "text-orange-800",
      bgDark: "bg-orange-500",
    },
  }

  return (
    styles[jobFamily] || {
      bg: "bg-gray-100",
      border: "border-gray-200",
      text: "text-gray-800",
      bgDark: "bg-gray-500",
    }
  )
}
