export interface Employee {
  name: string
  manager: string
  role: string
  jobFamily: string
}

// Simplified org chart with sample data - 1 CEO, 4 VPs, managers, and individual contributors
export const employees: Employee[] = [
  // CEO
  { name: "Emma T", manager: "", role: "CEO", jobFamily: "Leadership" },

  // VPs reporting to CEO
  { name: "Marcus R", manager: "Emma T", role: "VP Engineering", jobFamily: "Leadership" },
  { name: "Sofia L", manager: "Emma T", role: "VP Product", jobFamily: "Leadership" },
  { name: "Oliver K", manager: "Emma T", role: "VP Design", jobFamily: "Leadership" },
  { name: "Nina P", manager: "Emma T", role: "VP Operations", jobFamily: "Leadership" },

  // Engineering Managers
  { name: "Diego M", manager: "Marcus R", role: "Engineering Manager", jobFamily: "Engineering" },
  { name: "Zoe H", manager: "Marcus R", role: "Senior Engineering Manager", jobFamily: "Engineering" },

  // Product Managers
  { name: "Kai W", manager: "Sofia L", role: "Senior Product Manager", jobFamily: "Product" },
  { name: "Luna C", manager: "Sofia L", role: "Product Manager", jobFamily: "Product" },

  // Design Manager
  { name: "Felix D", manager: "Oliver K", role: "Design Manager", jobFamily: "Design" },

  // Operations Manager
  { name: "Iris V", manager: "Nina P", role: "Operations Manager", jobFamily: "Operations" },

  // Engineering Individual Contributors
  { name: "Theo B", manager: "Diego M", role: "Senior Software Engineer", jobFamily: "Engineering" },
  { name: "Maya S", manager: "Diego M", role: "Software Engineer", jobFamily: "Engineering" },
  { name: "Axel J", manager: "Diego M", role: "Software Engineer", jobFamily: "Engineering" },
  { name: "Ruby N", manager: "Zoe H", role: "Senior Software Engineer", jobFamily: "Engineering" },
  { name: "Leo F", manager: "Zoe H", role: "Software Engineer", jobFamily: "Engineering" },
  { name: "Sage Q", manager: "Zoe H", role: "DevOps Engineer", jobFamily: "Engineering" },

  // Product Individual Contributors
  { name: "River A", manager: "Kai W", role: "Product Analyst", jobFamily: "Product" },
  { name: "Nova G", manager: "Luna C", role: "Associate Product Manager", jobFamily: "Product" },
  { name: "Atlas E", manager: "Luna C", role: "Product Marketing Manager", jobFamily: "Product" },

  // Design Individual Contributors
  { name: "Wren I", manager: "Felix D", role: "Senior UX Designer", jobFamily: "Design" },
  { name: "Phoenix O", manager: "Felix D", role: "UI Designer", jobFamily: "Design" },
  { name: "Sage M", manager: "Felix D", role: "UX Researcher", jobFamily: "Design" },

  // Operations Individual Contributors
  { name: "Storm Y", manager: "Iris V", role: "DevOps Engineer", jobFamily: "Operations" },
  { name: "Echo Z", manager: "Iris V", role: "Operations Analyst", jobFamily: "Operations" },
]
