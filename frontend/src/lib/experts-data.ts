export type Expert = {
  id: string;
  name: string;
  title: string;
  industry: string;
  tags: string[];
  rating: number;
  appointments: number;
  approvalRate: number;
  yearsExperience: number;
  priceETB: number;
  offering: string;
  deliverable: string;
  bio: string;
  online: boolean;
  verified: boolean;
  initials: string;
  accent: string; // hsl token bg color
};

const accents = [
  "from-orange-500/30 to-orange-500/5",
  "from-emerald-500/30 to-emerald-500/5",
  "from-sky-500/30 to-sky-500/5",
  "from-violet-500/30 to-violet-500/5",
  "from-rose-500/30 to-rose-500/5",
  "from-amber-500/30 to-amber-500/5",
];

const seed: Omit<Expert, "id" | "initials" | "accent">[] = [
  { name: "Dawit Tadesse", title: "Senior Business Strategist & Financial Modeler", industry: "Agro-Processing", tags: ["Feasibility Studies", "Financial Modeling", "Agro"], rating: 4.9, appointments: 124, approvalRate: 98, yearsExperience: 9, priceETB: 500, offering: "Full Feasibility Study (Standard)", deliverable: "Includes 12-Month Financial Forecast", bio: "Specialist in AI-native business plans for 50+ Ethiopian sectors.", online: true, verified: true },
  { name: "Hanna Mekonnen", title: "Investment Analyst & Bank Liaison", industry: "Banking & Finance", tags: ["Bank Approval", "SME Loans", "CBE"], rating: 4.8, appointments: 98, approvalRate: 96, yearsExperience: 7, priceETB: 500, offering: "Bank-Ready Business Plan", deliverable: "Loan Application Pack + Pitch", bio: "Former CBE credit analyst — structures loan-ready documents.", online: true, verified: true },
  { name: "Yonas Bekele", title: "Manufacturing Operations Consultant", industry: "Manufacturing", tags: ["Plant Setup", "Supply Chain", "CAPEX"], rating: 4.7, appointments: 76, approvalRate: 94, yearsExperience: 11, priceETB: 500, offering: "Industrial Feasibility Study", deliverable: "CAPEX/OPEX + 5Y Projection", bio: "Designed 30+ light-manufacturing facilities across Oromia.", online: false, verified: true },
  { name: "Selamawit Alemu", title: "Agribusiness & Export Strategist", industry: "Agriculture", tags: ["Coffee Export", "Cooperatives", "ECX"], rating: 5.0, appointments: 142, approvalRate: 99, yearsExperience: 12, priceETB: 500, offering: "Export Feasibility Study", deliverable: "ECX Compliance + Trade Plan", bio: "Coffee & spice export specialist with deep ECX network.", online: true, verified: true },
  { name: "Bereket Girma", title: "Tech & SaaS Strategy Consultant", industry: "Technology", tags: ["SaaS Strategy", "Fintech", "GTM"], rating: 4.8, appointments: 65, approvalRate: 95, yearsExperience: 6, priceETB: 500, offering: "SaaS Business Plan", deliverable: "GTM + Unit Economics Model", bio: "Helped 20+ Addis startups raise pre-seed and seed.", online: true, verified: true },
  { name: "Mahlet Assefa", title: "Healthcare & Pharma Consultant", industry: "Healthcare", tags: ["Clinic Setup", "Pharma", "EFDA"], rating: 4.9, appointments: 88, approvalRate: 97, yearsExperience: 10, priceETB: 500, offering: "Clinic Feasibility & Licensing Plan", deliverable: "EFDA Pack + Equipment List", bio: "Licensed 50+ private clinics & pharmacies nationwide.", online: false, verified: true },
  { name: "Ermias Worku", title: "Real Estate & Construction Analyst", industry: "Real Estate", tags: ["Real Estate", "Construction", "ROI"], rating: 4.6, appointments: 54, approvalRate: 92, yearsExperience: 14, priceETB: 500, offering: "Real Estate Feasibility Study", deliverable: "Site Analysis + ROI Model", bio: "Modeled $40M+ residential and mixed-use developments.", online: true, verified: true },
  { name: "Tigist Haile", title: "Tourism & Hospitality Strategist", industry: "Tourism", tags: ["Hotels", "Eco-Tourism", "Hospitality"], rating: 4.8, appointments: 72, approvalRate: 95, yearsExperience: 8, priceETB: 500, offering: "Hospitality Business Plan", deliverable: "Operations + Revenue Forecast", bio: "Boutique hotel and lodge operator across Bahir Dar & Lalibela.", online: true, verified: true },
  { name: "Solomon Abebe", title: "Logistics & Transport Consultant", industry: "Logistics", tags: ["Freight", "Fleet", "Cross-Border"], rating: 4.7, appointments: 61, approvalRate: 93, yearsExperience: 13, priceETB: 500, offering: "Logistics Feasibility Study", deliverable: "Fleet CAPEX + Route Economics", bio: "Built nationwide fleet operations from Djibouti to Addis.", online: false, verified: true },
  { name: "Liya Tesfaye", title: "Fashion & Textile Industry Expert", industry: "Textile", tags: ["Garments", "Export", "Hawassa IP"], rating: 4.9, appointments: 80, approvalRate: 96, yearsExperience: 9, priceETB: 500, offering: "Textile Plant Feasibility", deliverable: "Hawassa IP Pack + Export Plan", bio: "Industrial-park textile expert with EU buyer network.", online: true, verified: true },
  { name: "Kalkidan Fikru", title: "Education & EdTech Consultant", industry: "Education", tags: ["Schools", "EdTech", "Licensing"], rating: 4.7, appointments: 47, approvalRate: 94, yearsExperience: 7, priceETB: 500, offering: "School Setup Feasibility", deliverable: "MoE Licensing Pack", bio: "K-12 and EdTech founder with MoE licensing experience.", online: true, verified: true },
  { name: "Robel Nigussie", title: "Renewable Energy Engineer", industry: "Energy", tags: ["Solar", "Mini-Grid", "EEP"], rating: 4.8, appointments: 39, approvalRate: 95, yearsExperience: 10, priceETB: 500, offering: "Renewable Energy Feasibility", deliverable: "Solar Sizing + IRR Model", bio: "Off-grid solar specialist for rural Ethiopia.", online: false, verified: true },
  { name: "Meron Solomon", title: "Marketing & Brand Strategist", industry: "Marketing", tags: ["Brand", "Digital", "B2C"], rating: 4.6, appointments: 92, approvalRate: 91, yearsExperience: 6, priceETB: 500, offering: "Go-To-Market Plan", deliverable: "Channel Mix + KPI Dashboard", bio: "Launched 30+ Ethiopian D2C brands online.", online: true, verified: true },
  { name: "Abel Tariku", title: "Mining & Minerals Consultant", industry: "Mining", tags: ["Mining", "Geology", "MoMP"], rating: 4.8, appointments: 28, approvalRate: 96, yearsExperience: 15, priceETB: 500, offering: "Mining Feasibility Study", deliverable: "Reserve Estimate + Permit Pack", bio: "Licensed geological surveyor with MoMP relationships.", online: false, verified: true },
  { name: "Helen Berhanu", title: "Food & Beverage Consultant", industry: "Food & Beverage", tags: ["F&B", "Restaurants", "EFDA"], rating: 4.9, appointments: 110, approvalRate: 97, yearsExperience: 8, priceETB: 500, offering: "Restaurant Feasibility & Concept", deliverable: "Menu Engineering + 3Y P&L", bio: "Opened 12 high-traffic restaurants in Addis.", online: true, verified: true },
  { name: "Nahom Girmay", title: "Import/Export Trade Consultant", industry: "Trade", tags: ["Imports", "Customs", "FX"], rating: 4.7, appointments: 66, approvalRate: 93, yearsExperience: 11, priceETB: 500, offering: "Import Business Plan", deliverable: "FX + Customs Cost Model", bio: "Navigates NBE FX policy for importers daily.", online: true, verified: true },
  { name: "Eden Asrat", title: "HR & Organizational Consultant", industry: "HR & Org", tags: ["Org Design", "Hiring", "Policy"], rating: 4.6, appointments: 52, approvalRate: 90, yearsExperience: 9, priceETB: 500, offering: "Organizational Structure Plan", deliverable: "Org Chart + HR Policy Pack", bio: "Built HR systems for 100+ employee companies.", online: false, verified: true },
  { name: "Yared Demeke", title: "Insurance & Risk Analyst", industry: "Insurance", tags: ["Risk", "Insurance", "Compliance"], rating: 4.7, appointments: 33, approvalRate: 94, yearsExperience: 12, priceETB: 500, offering: "Risk & ESG Assessment", deliverable: "Risk Matrix + Mitigation Plan", bio: "Former Awash Insurance underwriter.", online: true, verified: true },
  { name: "Sara Worku", title: "Legal & Regulatory Advisor", industry: "Legal", tags: ["Licensing", "Contracts", "MoTI"], rating: 4.8, appointments: 71, approvalRate: 96, yearsExperience: 10, priceETB: 500, offering: "Legal Compliance Pack", deliverable: "MoTI Licensing + Templates", bio: "Corporate lawyer specializing in business setup.", online: true, verified: true },
  { name: "Henok Getachew", title: "E-Commerce & Payments Expert", industry: "E-Commerce", tags: ["E-Comm", "Telebirr", "Chapa"], rating: 4.9, appointments: 84, approvalRate: 97, yearsExperience: 7, priceETB: 500, offering: "E-Commerce Launch Plan", deliverable: "Tech Stack + Payment Integration", bio: "Telebirr + Chapa integration specialist.", online: true, verified: true },
];

export const experts: Expert[] = seed.map((e, i) => ({
  ...e,
  id: `exp-${i + 1}`,
  initials: e.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
  accent: accents[i % accents.length],
}));
