export interface OrgNode {
  id: string
  name: string
  role: string
  jobFamily: string
  children: OrgNode[]
  x: number
  y: number
  level: number
}

export type RoleLevel = "executive" | "senior" | "manager" | "individual"

export interface JobFamilyStyle {
  bg: string
  border: string
  text: string
  bgDark: string
}

export interface CardStyle {
  card: string
  name: string
  role: string
  height: number
}
