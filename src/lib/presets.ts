export type BusinessPreset = {
  id: string
  label: string
  description: string
  googleTypes: string[]
}

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: "restaurants",
    label: "Restaurants",
    description: "Independent and chain food venues",
    googleTypes: ["restaurant", "meal_takeaway", "cafe"],
  },
  {
    id: "beauty",
    label: "Beauty & Wellness",
    description: "Salons, spas, barbers, and aesthetic services",
    googleTypes: ["beauty_salon", "hair_care", "spa", "barber_shop"],
  },
  {
    id: "health",
    label: "Health Clinics",
    description: "Dentists, physiotherapists, and small medical offices",
    googleTypes: ["dentist", "doctor", "physical_therapy_clinic"],
  },
  {
    id: "home-services",
    label: "Home Services",
    description: "Plumbers, electricians, locksmiths, and repair shops",
    googleTypes: ["plumber", "electrician", "locksmith", "roofing_contractor"],
  },
  {
    id: "professional",
    label: "Professional Services",
    description: "Law firms, accountants, and consultants",
    googleTypes: ["lawyer", "accounting", "real_estate_agency", "insurance_agency"],
  },
  {
    id: "fitness",
    label: "Fitness",
    description: "Gyms, yoga studios, martial arts, and trainers",
    googleTypes: ["gym", "yoga_studio", "sports_club"],
  },
]

export const presetTypeMap = new Map(
  BUSINESS_PRESETS.map((preset) => [preset.id, preset.googleTypes]),
)
