import { getJobFamilyColor } from "@/utils/styling"

export function ChartLegend() {
  return (
    <div className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-slate-200 shadow-sm">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">Job Families</h4>
      <div className="space-y-2">
        {/* Updated legend to show new job families */}
        {["Leadership", "Product", "Engineering", "Design", "Operations"].map((family) => {
          const style = getJobFamilyColor(family)
          return (
            <div key={family} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${style.bgDark} shadow-sm`}></div>
              <span className="text-xs text-slate-600">{family}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
