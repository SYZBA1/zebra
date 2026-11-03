export interface OutlineNode {
  id: string;
  title: string;
  titleAm?: string;
  children?: OutlineNode[];
  content?: string;
}

export const FEASIBILITY_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "Introduction", titleAm: "መግቢያ", children: [
      { id: "2.1", title: "Economic Background", titleAm: "ኢኮኖሚያዊ ዳራ" },
      { id: "2.2", title: "Growth and Drivers", titleAm: "ዕድገት እና አንቀሳቃሾች" },
    ]
  },
  {
    id: "3", title: "Background of Project Area", titleAm: "የፕሮጀክት ቦታ ዳራ", children: [
      { id: "3.1", title: "Location", titleAm: "ቦታ" },
      { id: "3.2", title: "Demographics", titleAm: "የሕዝብ ስነ-ሕዝብ" },
      { id: "3.3", title: "Cultural Context", titleAm: "ባህላዊ ዐውድ" },
      { id: "3.4", title: "Sector-Relevant Resources", titleAm: "ከዘርፉ ጋር የሚገናኙ ሀብቶች" },
      { id: "3.5", title: "Infrastructure", titleAm: "መሠረተ ልማት" },
      { id: "3.6", title: "Natural Resources", titleAm: "የተፈጥሮ ሀብቶች" },
      { id: "3.7", title: "Socio-economic Situations", titleAm: "ማህበራዊ-ኢኮኖሚያዊ ሁኔታዎች" },
      { id: "3.8", title: "Sustainability Assessment", titleAm: "የዘላቂነት ግምገማ" },
      { id: "3.9", title: "Operational Risks", titleAm: "የአሰራር አደጋዎች" },
      { id: "3.10", title: "SWOT Analysis", titleAm: "SWOT ትንተና" },
    ]
  },
  {
    id: "4", title: "Product/Service Description", titleAm: "የምርት/አገልግሎት መግለጫ", children: [
      { id: "4.1", title: "Primary Product/Service", titleAm: "ዋና ምርት/አገልግሎት" },
      { id: "4.2", title: "Secondary Products/By-products", titleAm: "ሁለተኛ ምርቶች/ተረፈ ምርቶች" },
      { id: "4.3", title: "Project Objectives", titleAm: "የፕሮጀክት ዓላማዎች" },
      { id: "4.4", title: "Benefits of the Project", titleAm: "የፕሮጀክቱ ጥቅሞች" },
    ]
  },
  {
    id: "5", title: "Market Study & Capacity", titleAm: "የገበያ ጥናት እና አቅም", children: [
      { id: "5.1", title: "Market Analysis", titleAm: "የገበያ ትንተና" },
      { id: "5.2", title: "Demand Projection", titleAm: "የፍላጎት ትንበያ" },
      { id: "5.3", title: "Pricing and Distribution", titleAm: "ዋጋ እና ስርጭት" },
      { id: "5.4", title: "Target Market Location", titleAm: "ዒላማ የገበያ ቦታ" },
      { id: "5.5", title: "Sector Features", titleAm: "የዘርፍ ባህሪያት" },
      { id: "5.6", title: "Beneficiaries", titleAm: "ተጠቃሚዎች" },
      { id: "5.7", title: "Competitor Analysis", titleAm: "ተወዳዳሪ ትንተና" },
      { id: "5.8", title: "Project Justification", titleAm: "የፕሮጀክት ማረጋገጫ" },
      { id: "5.9", title: "Strategic Support", titleAm: "ስትራቴጂካዊ ድጋፍ" },
    ]
  },
  {
    id: "6", title: "Operational Capacity & Program", titleAm: "የአሰራር አቅም እና ፕሮግራም", children: [
      { id: "6.1", title: "Installed Capacity", titleAm: "የተጫነ አቅም" },
      { id: "6.2", title: "Production/Service Program", titleAm: "የምርት/አገልግሎት ፕሮግራም" },
    ]
  },
  {
    id: "7", title: "Inputs and Utilities", titleAm: "ግብዓቶች እና መገልገያዎች", children: [
      { id: "7.1", title: "Direct Inputs", titleAm: "ቀጥተኛ ግብዓቶች" },
      { id: "7.2", title: "Utilities", titleAm: "መገልገያዎች" },
    ]
  },
  {
    id: "8", title: "Technology and Engineering", titleAm: "ቴክኖሎጂ እና ምህንድስና", children: [
      { id: "8.1", title: "Technology Choice", titleAm: "የቴክኖሎጂ ምርጫ" },
      { id: "8.2", title: "Engineering & Assets", titleAm: "ምህንድስና እና ንብረቶች" },
    ]
  },
  {
    id: "9", title: "Organization & Management", titleAm: "ድርጅት እና አስተዳደር", children: [
      { id: "9.1", title: "Manpower Requirement", titleAm: "የሰው ኃይል ፍላጎት" },
      { id: "9.2", title: "Organizational Structure", titleAm: "ድርጅታዊ አወቃቀር" },
      { id: "9.3", title: "Training Needs", titleAm: "የሥልጠና ፍላጎቶች" },
      { id: "9.4", title: "Implementation Schedule", titleAm: "የአፈጻጸም መርሃ ግብር" },
    ]
  },
  {
    id: "10", title: "Financial Feasibility", titleAm: "የፋይናንስ ተግባራዊነት", children: [
      { id: "10.1", title: "Basic Assumptions", titleAm: "መሰረታዊ ግምቶች" },
      { id: "10.2", title: "Financial Analysis Results", titleAm: "የፋይናንስ ትንተና ውጤቶች" },
      { id: "10.3", title: "Revenue Projections", titleAm: "የገቢ ትንበያዎች" },
      { id: "10.4", title: "Key Metrics", titleAm: "ዋና መለኪያዎች" },
      { id: "10.5", title: "Risk Analysis", titleAm: "የአደጋ ትንተና" },
      { id: "10.6", title: "Impact Assessment", titleAm: "ተጽዕኖ ግምገማ" },
    ]
  },
  { id: "11", title: "Conclusion & Recommendation", titleAm: "ማጠቃለያ እና ምክረ ሐሳብ" },
  { id: "annexes", title: "Annexes", titleAm: "አባሪዎች" },
];

export interface SectorCategory {
  label: string;
  labelAm: string;
  sectors: string[];
}

export const SECTOR_CATEGORIES: SectorCategory[] = [
  {
    label: "Service",
    labelAm: "አገልግሎት",
    sectors: [
      "Tour and Travel",
      "Car Rental",
      "Education / University, School & Training",
      "Information Technology Services",
      "Advertising, Promotion, Media & Entertainment",
      "Professional Services & Consulting",
      "Transport & Logistics",
      "Hospitality & Hotels",
      "Health & Medical Services",
      "Associations & NGOs",
      "Government & Public Organizations",
      "Financial Services & Banking",
      "Insurance Services",
      "Legal Services",
      "Event Management & Catering",
      "Cleaning & Facility Management",
      "Beauty, Salon & Spa",
      "Fitness & Wellness",
      "Telecommunications Services",
      "Security & Guard Services",
      "Real Estate Brokerage & Property Management",
      "Maintenance & Repair Services",
    ],
  },
  {
    label: "Product",
    labelAm: "ምርት",
    sectors: [
      "Construction & Building Materials",
      "Automotive & Vehicles",
      "Food & Beverages Manufacturing",
      "Agriculture & Farming",
      "Retail & Shopping",
      "Manufacturing & Industry",
      "Export Trade",
      "Foreign Suppliers to Ethiopia",
      "Textile & Garment",
      "Furniture & Interior Design",
      "Pharmaceuticals & Medical Devices",
      "Printing & Publishing",
      "Packaging & Plastics",
      "Leather & Leather Products",
      "Electronics & Electrical Equipment",
      "Hardware & Tools",
      "Chemical & Industrial Products",
      "Cosmetics & Personal Care Products",
    ],
  },
  {
    label: "Food & Hospitality",
    labelAm: "ምግብ እና መስተንግዶ",
    sectors: [
      "Café & Coffee Shop",
      "Restaurant & Fine Dining",
      "Fast Food & Quick Service",
      "Bakery & Pastry",
      "Catering & Banquet Services",
      "Food Processing & Packaging",
      "Beverage Production (Juice, Water, Alcohol)",
    ],
  },
  {
    label: "Technology",
    labelAm: "ቴክኖሎጂ",
    sectors: [
      "Software Development & SaaS",
      "FinTech & Digital Payments",
      "AgriTech & Smart Farming",
      "HealthTech & Telemedicine",
      "EdTech & Online Learning",
      "AI & Data Analytics",
      "Cybersecurity",
      "E-commerce & Digital Marketplace",
    ],
  },
  {
    label: "Energy & Resources",
    labelAm: "ኃይል እና ሀብቶች",
    sectors: [
      "Renewable Energy (Solar, Wind, Hydro)",
      "Mining & Mineral Processing",
      "Water Supply & Irrigation",
      "Waste Management & Recycling",
      "Oil, Gas & Petroleum",
      "Environmental Consulting",
    ],
  },
  {
    label: "Real Estate & Construction",
    labelAm: "ሪል ስቴት እና ግንባታ",
    sectors: [
      "Residential Real Estate Development",
      "Commercial Real Estate",
      "Engineering & Architecture",
      "Road & Infrastructure Construction",
    ],
  },
];

// Flat list for backward compat
export const SECTORS = SECTOR_CATEGORIES.flatMap((c) => c.sectors);

export type BusinessScale = "sme" | "medium" | "industrial";

export const BUSINESS_SCALES: { value: BusinessScale; label: string; labelAm: string; description: string }[] = [
  { value: "sme", label: "SME", labelAm: "ጥቃቅንና አነስተኛ", description: "Small to Medium Enterprise (1–50 employees)" },
  { value: "medium", label: "Medium-Sized", labelAm: "መካከለኛ", description: "Medium-Sized Enterprise (51–250 employees)" },
  { value: "industrial", label: "Industrial Standard", labelAm: "ኢንዱስትሪያል", description: "Industrial / Large Enterprise (250+ employees)" },
];
