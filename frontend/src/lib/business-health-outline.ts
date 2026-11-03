import type { OutlineNode } from "./feasibility-outline";

export const BUSINESS_HEALTH_OUTLINE: OutlineNode[] = [
  { id: "cover", title: "Cover Page Details", titleAm: "የሽፋን ገጽ ዝርዝሮች" },
  { id: "1", title: "Executive Summary", titleAm: "ዋና ማጠቃለያ" },
  {
    id: "2", title: "Cash Flow Analysis", titleAm: "የገንዘብ ፍሰት ትንተና", children: [
      { id: "2.1", title: "Cash Flow Runway", titleAm: "የገንዘብ ፍሰት ርዝመት" },
      { id: "2.2", title: "Monthly Burn Rate", titleAm: "ወርሃዊ የወጪ መጠን" },
      { id: "2.3", title: "Cash Flow Projections", titleAm: "የገንዘብ ፍሰት ትንበያዎች" },
    ]
  },
  {
    id: "3", title: "Profitability Analysis", titleAm: "የትርፍ ትንተና", children: [
      { id: "3.1", title: "Profit Margins per Service Line", titleAm: "በአገልግሎት መስመር የትርፍ ህዳግ" },
      { id: "3.2", title: "Gross vs Net Margins", titleAm: "ጠቅላላ እና ተጣራ ህዳግ" },
      { id: "3.3", title: "Break-Even Analysis", titleAm: "የማስታረቅ ትንተና" },
    ]
  },
  {
    id: "4", title: "Risk vs. Mitigation Matrix", titleAm: "ስጋት ከቅነሳ ማትሪክስ", children: [
      { id: "4.1", title: "Financial Risks", titleAm: "ፋይናንሻል ስጋቶች" },
      { id: "4.2", title: "Operational Risks", titleAm: "የአሰራር ስጋቶች" },
      { id: "4.3", title: "Market Risks", titleAm: "የገበያ ስጋቶች" },
      { id: "4.4", title: "Mitigation Strategies", titleAm: "የቅነሳ ስትራቴጂዎች" },
    ]
  },
  {
    id: "5", title: "Health Dashboard Summary", titleAm: "የጤና ዳሽቦርድ ማጠቃለያ", children: [
      { id: "5.1", title: "Key Health Indicators", titleAm: "ቁልፍ የጤና አመላካቾች" },
      { id: "5.2", title: "Threshold Alerts", titleAm: "የገደብ ማንቂያዎች" },
      { id: "5.3", title: "Burn Rate Monitoring", titleAm: "የወጪ መጠን ክትትል" },
    ]
  },
  {
    id: "6", title: "Operational Efficiency", titleAm: "የአሰራር ቅልጥፍና", children: [
      { id: "6.1", title: "Cost Optimization", titleAm: "የወጪ ማመቻቸት" },
      { id: "6.2", title: "Revenue per Employee", titleAm: "በሰራተኛ ገቢ" },
    ]
  },
  { id: "7", title: "Financial Projections & Scenarios", titleAm: "የፋይናንስ ትንበያዎች እና ሁኔታዎች" },
  { id: "8", title: "Conclusion & Action Items", titleAm: "ማጠቃለያ እና የድርጊት ዕቅድ" },
];
