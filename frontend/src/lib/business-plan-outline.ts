import type { OutlineNode } from "./feasibility-outline";

export const BUSINESS_PLAN_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "Company Description", titleAm: "ስለ ድርጅቱ", children: [
      { id: "2.1", title: "Mission & Vision", titleAm: "ተልዕኮ እና ራዕይ" },
      { id: "2.2", title: "Legal Structure", titleAm: "ህጋዊ አወቃቀር" },
      { id: "2.3", title: "History & Background", titleAm: "ታሪክ እና ዳራ" },
    ]
  },
  {
    id: "3", title: "Products & Services", titleAm: "ምርቶች እና አገልግሎቶች", children: [
      { id: "3.1", title: "Product/Service Description", titleAm: "የምርት/አገልግሎት መግለጫ" },
      { id: "3.2", title: "Unique Value Proposition", titleAm: "ልዩ የዋጋ ሀሳብ" },
      { id: "3.3", title: "Pricing Strategy", titleAm: "የዋጋ ስትራቴጂ" },
    ]
  },
  {
    id: "4", title: "Market Analysis", titleAm: "የገበያ ትንተና", children: [
      { id: "4.1", title: "Industry Overview", titleAm: "የኢንዱስትሪ ዳሰሳ" },
      { id: "4.2", title: "Target Market", titleAm: "ዒላማ ገበያ" },
      { id: "4.3", title: "Competitive Analysis", titleAm: "ተወዳዳሪ ትንተና" },
      { id: "4.4", title: "SWOT Analysis", titleAm: "SWOT ትንተና" },
    ]
  },
  {
    id: "5", title: "Marketing & Sales Strategy", titleAm: "ግብይት እና ሽያጭ ስትራቴጂ", children: [
      { id: "5.1", title: "Marketing Plan", titleAm: "የግብይት ዕቅድ" },
      { id: "5.2", title: "Sales Strategy", titleAm: "የሽያጭ ስትራቴጂ" },
      { id: "5.3", title: "Distribution Channels", titleAm: "የማሰራጫ መንገዶች" },
    ]
  },
  {
    id: "6", title: "Operations Plan", titleAm: "የአሰራር ዕቅድ", children: [
      { id: "6.1", title: "Location & Facilities", titleAm: "ቦታ እና ማዕከላት" },
      { id: "6.2", title: "Technology & Equipment", titleAm: "ቴክኖሎጂ እና መሣሪያዎች" },
      { id: "6.3", title: "Supply Chain", titleAm: "የአቅርቦት ሰንሰለት" },
    ]
  },
  {
    id: "7", title: "Management & Organization", titleAm: "አስተዳደር እና ድርጅት", children: [
      { id: "7.1", title: "Management Team", titleAm: "የአስተዳደር ቡድን" },
      { id: "7.2", title: "Organizational Structure", titleAm: "ድርጅታዊ አወቃቀር" },
      { id: "7.3", title: "Human Resources Plan", titleAm: "የሰው ሃብት ዕቅድ" },
    ]
  },
  {
    id: "8", title: "Financial Plan", titleAm: "የፋይናንስ ዕቅድ", children: [
      { id: "8.1", title: "Startup Costs", titleAm: "የመነሻ ወጪዎች" },
      { id: "8.2", title: "Revenue Projections", titleAm: "የገቢ ትንበያዎች" },
      { id: "8.3", title: "Profit & Loss Forecast", titleAm: "ትርፍ እና ኪሳራ ትንበያ" },
      { id: "8.4", title: "Cash Flow Statement", titleAm: "የጥሬ ገንዘብ ፍሰት" },
      { id: "8.5", title: "Break-even Analysis", titleAm: "የማስመለሻ ትንተና" },
      { id: "8.6", title: "Funding Requirements", titleAm: "የፈንድ ፍላጎቶች" },
    ]
  },
  {
    id: "9", title: "Risk Analysis", titleAm: "የአደጋ ትንተና", children: [
      { id: "9.1", title: "Risk Identification", titleAm: "አደጋ ለይቶ ማወቅ" },
      { id: "9.2", title: "Mitigation Strategies", titleAm: "የመቀነሻ ስትራቴጂዎች" },
    ]
  },
  { id: "10", title: "Implementation Timeline", titleAm: "የአፈጻጸም የጊዜ ሰሌዳ" },
  { id: "annexes", title: "Annexes", titleAm: "አባሪዎች" },
];
